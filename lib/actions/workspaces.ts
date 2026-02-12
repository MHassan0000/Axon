"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import { canCreateWorkspace } from "@/lib/billing";
import { 
  validateInput, 
  createWorkspaceSchema, 
  updateWorkspaceSchema 
} from "@/lib/validations";
import { z } from "zod";
import type { 
  Workspace, 
  WorkspaceMember, 
  WorkspaceWithBoards,
  CreateWorkspaceInput,
  UpdateWorkspaceInput 
} from "@/lib/types/database";

// Validation schema for adding workspace member
const addWorkspaceMemberSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace ID"),
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum(["admin", "member"]).optional().default("member"),
});

export async function createWorkspace(
  input: CreateWorkspaceInput
): Promise<{ workspace: Workspace | null; error?: string }> {
  const validation = validateInput(createWorkspaceSchema, input);
  if (!validation.success) {
    return { workspace: null, error: validation.error };
  }
  const validData = validation.data;

  const user = await getCurrentUser();
  
  if (!user) {
    return { workspace: null, error: "User not authenticated" };
  }

  const supabase = await createClient();

  const { count: workspaceCount } = await supabase
    .from("workspaces")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const canCreate = await canCreateWorkspace(workspaceCount || 0);
  if (!canCreate.allowed) {
    return { workspace: null, error: canCreate.reason };
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: validData.name,
      description: validData.description || null,
      owner_id: user.id,
    })
    .select()
    .single();

  if (workspaceError) {
    return { workspace: null, error: "Failed to create workspace" };
  }

  await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    });

  return { workspace };
}

export async function getWorkspaces(): Promise<Workspace[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }

  const supabase = await createClient();

  const { data: memberships, error: memberError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id);

  if (memberError || !memberships?.length) {
    return [];
  }

  const workspaceIds = memberships.map((m) => m.workspace_id);

  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("*")
    .in("id", workspaceIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching workspaces:", error);
    return [];
  }

  return workspaces;
}

export async function getWorkspaceWithBoards(
  workspaceId: string
): Promise<WorkspaceWithBoards | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    console.error("User is not a member of this workspace");
    return null;
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (error) {
    console.error("Error fetching workspace:", error);
    return null;
  }

  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  return {
    ...workspace,
    boards: boards || [],
  };
}

export async function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput
): Promise<Workspace | null> {
  const idValidation = z.string().uuid("Invalid workspace ID").safeParse(workspaceId);
  if (!idValidation.success) {
    console.error("Invalid workspace ID");
    return null;
  }

  const validation = validateInput(updateWorkspaceSchema, input);
  if (!validation.success) {
    console.error("Validation failed:", validation.error);
    return null;
  }
  const validData = validation.data;

  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    console.error("User does not have permission to update workspace");
    return null;
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .update(validData)
    .eq("id", workspaceId)
    .select()
    .single();

  if (error) {
    console.error("Error updating workspace:", error);
    return null;
  }

  return workspace;
}

export async function deleteWorkspace(workspaceId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  const supabase = await createClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace || workspace.owner_id !== user.id) {
    console.error("Only owner can delete workspace");
    return false;
  }

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) {
    console.error("Error deleting workspace:", error);
    return false;
  }

  return true;
}

export async function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: "admin" | "member" = "member"
): Promise<WorkspaceMember | null> {
  const validation = addWorkspaceMemberSchema.safeParse({ workspaceId, userId, role });
  if (!validation.success) {
    console.error("Validation failed:", validation.error.issues[0]?.message);
    return null;
  }

  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    console.error("User does not have permission to add members");
    return null;
  }

  const { data: newMember, error } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      role,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding member:", error);
    return null;
  }

  // Send notification to the new member
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .single();

  if (workspace) {
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "workspace_invite",
      title: "You were added to a workspace",
      message: `${user.name || "Someone"} added you to the workspace "${workspace.name}"`,
      link: `/dashboard?workspace=${workspaceId}`,
    });
  }

  return newMember;
}

export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    console.error("User does not have permission to remove members");
    return false;
  }

  // Cannot remove owner
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (workspace?.owner_id === userId) {
    console.error("Cannot remove workspace owner");
    return false;
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error removing member:", error);
    return false;
  }

  // This allows the user to be re-invited later
  await supabase
    .from("workspace_invites")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("invitee_id", userId);

  return true;
}

export async function getWorkspaceMembers(
  workspaceId: string
): Promise<{ id: string; name: string | null; email: string; avatar_url: string | null; role: string }[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.error("User not authenticated");
    return [];
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    console.error("User is not a member of this workspace");
    return [];
  }

  const { data: members, error } = await supabase
    .from("workspace_members")
    .select("role, users(*)")
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("Error fetching workspace members:", error);
    return [];
  }

  return (members || []).map((m: any) => ({
    id: m.users.id,
    name: m.users.name,
    email: m.users.email,
    avatar_url: m.users.avatar_url,
    role: m.role,
  }));
}

export async function sendWorkspaceInvite(
  workspaceId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return { success: false, error: "You don't have permission to invite members" };
  }

  // Look up the user by email
  const { data: targetUser } = await supabase
    .from("users")
    .select("id, name")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!targetUser) {
    return { success: false, error: "No user found with this email. They need to sign up first." };
  }

  // Can't invite yourself
  if (targetUser.id === user.id) {
    return { success: false, error: "You can't invite yourself" };
  }

  const { data: existingMembership } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", targetUser.id)
    .single();

  if (existingMembership) {
    return { success: false, error: "This user is already a member of the workspace" };
  }

  const { data: existingInvite } = await supabase
    .from("workspace_invites")
    .select("id, status")
    .eq("workspace_id", workspaceId)
    .eq("invitee_id", targetUser.id)
    .eq("status", "pending")
    .single();

  if (existingInvite) {
    return { success: false, error: "An invite has already been sent to this user" };
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    return { success: false, error: "Workspace not found" };
  }

  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .insert({
      workspace_id: workspaceId,
      inviter_id: user.id,
      invitee_id: targetUser.id,
      status: "pending",
    })
    .select()
    .single();

  if (inviteError) {
    console.error("Error creating invite:", inviteError);
    return { success: false, error: "Failed to send invite" };
  }

  // Send notification to the invitee with metadata for accept/decline
  await supabase.from("notifications").insert({
    user_id: targetUser.id,
    type: "workspace_invite",
    title: "Workspace Invitation",
    message: `${user.name || "Someone"} invited you to join "${workspace.name}"`,
    link: `/dashboard/workspace/${workspaceId}`,
    metadata: {
      invite_id: invite.id,
      workspace_id: workspaceId,
      workspace_name: workspace.name,
    },
  });

  return { success: true };
}

export async function acceptWorkspaceInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string; workspaceId?: string }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .select("*, workspaces(name)")
    .eq("id", inviteId)
    .eq("invitee_id", user.id)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    return { success: false, error: "Invite not found or already responded" };
  }

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: "member",
    });

  if (memberError) {
    // Could be duplicate - user might already be a member
    if (memberError.code === "23505") {
      await supabase
        .from("workspace_invites")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", inviteId);
      return { success: false, error: "You are already a member of this workspace" };
    }
    console.error("Error adding member:", memberError);
    return { success: false, error: "Failed to join workspace" };
  }

  await supabase
    .from("workspace_invites")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", inviteId);

  // Notify the inviter
  const workspaceName = (invite.workspaces as any)?.name || "the workspace";
  await supabase.from("notifications").insert({
    user_id: invite.inviter_id,
    type: "workspace_invite",
    title: "Invitation Accepted",
    message: `${user.name || "Someone"} accepted your invitation to join "${workspaceName}"`,
    link: `/dashboard/workspace/${invite.workspace_id}`,
  });

  return { success: true, workspaceId: invite.workspace_id };
}

export async function declineWorkspaceInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .select("*, workspaces(name)")
    .eq("id", inviteId)
    .eq("invitee_id", user.id)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    return { success: false, error: "Invite not found or already responded" };
  }

  // Notify the inviter before deleting the invite
  const workspaceName = (invite.workspaces as any)?.name || "the workspace";
  await supabase.from("notifications").insert({
    user_id: invite.inviter_id,
    type: "workspace_invite",
    title: "Invitation Declined",
    message: `${user.name || "Someone"} declined your invitation to join "${workspaceName}"`,
  });

  const { error: deleteError } = await supabase
    .from("workspace_invites")
    .delete()
    .eq("id", inviteId);

  if (deleteError) {
    return { success: false, error: "Failed to decline invite" };
  }

  return { success: true };
}

export async function leaveWorkspace(
  workspaceId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { success: false, error: "You are not a member of this workspace" };
  }

  // Owners cannot leave - they must delete or transfer ownership
  if (membership.role === "owner") {
    return { success: false, error: "Owners cannot leave their workspace. Delete it or transfer ownership first." };
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, owner_id")
    .eq("id", workspaceId)
    .single();

  const { error: deleteError } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Error leaving workspace:", deleteError);
    return { success: false, error: "Failed to leave workspace" };
  }

  // This allows the user to be re-invited later
  await supabase
    .from("workspace_invites")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("invitee_id", user.id);

  // Notify the workspace owner
  if (workspace?.owner_id) {
    await supabase.from("notifications").insert({
      user_id: workspace.owner_id,
      type: "workspace_invite",
      title: "Member Left",
      message: `${user.name || "A member"} has left "${workspace.name}"`,
      link: `/dashboard/workspace/${workspaceId}`,
    });
  }

  return { success: true };
}

export async function getWorkspacePendingInvites(
  workspaceId: string
): Promise<{ id: string; email: string; name: string | null; avatar_url: string | null; created_at: string }[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return [];
  }

  const { data: invites, error } = await supabase
    .from("workspace_invites")
    .select("id, created_at, users!workspace_invites_invitee_id_fkey(id, email, name, avatar_url)")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending invites:", error);
    return [];
  }

  return (invites || []).map((invite: any) => ({
    id: invite.id,
    email: invite.users?.email || "",
    name: invite.users?.name || null,
    avatar_url: invite.users?.avatar_url || null,
    created_at: invite.created_at,
  }));
}

export async function cancelWorkspaceInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = await createClient();

  const { data: invite } = await supabase
    .from("workspace_invites")
    .select("workspace_id, invitee_id")
    .eq("id", inviteId)
    .eq("status", "pending")
    .single();

  if (!invite) {
    return { success: false, error: "Invite not found" };
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", invite.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return { success: false, error: "You don't have permission to cancel this invite" };
  }

  const { error: deleteError } = await supabase
    .from("workspace_invites")
    .delete()
    .eq("id", inviteId);

  if (deleteError) {
    return { success: false, error: "Failed to cancel invite" };
  }

  await supabase
    .from("notifications")
    .delete()
    .eq("user_id", invite.invitee_id)
    .eq("type", "workspace_invite")
    .filter("metadata->invite_id", "eq", inviteId);

  return { success: true };
}

export async function getUserWorkspaceRole(
  workspaceId: string
): Promise<"owner" | "admin" | "member" | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  return membership?.role as "owner" | "admin" | "member" | null;
}

export const inviteWorkspaceMemberByEmail = sendWorkspaceInvite;
