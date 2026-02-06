"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import type { 
  Workspace, 
  WorkspaceMember, 
  WorkspaceWithBoards,
  CreateWorkspaceInput,
  UpdateWorkspaceInput 
} from "@/lib/types/database";

/**
 * Create a new workspace
 */
export async function createWorkspace(
  input: CreateWorkspaceInput
): Promise<Workspace | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const supabase = await createClient();

  // Create the workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: input.name,
      description: input.description || null,
      owner_id: user.id,
    })
    .select()
    .single();

  if (workspaceError) {
    console.error("Error creating workspace:", workspaceError);
    return null;
  }

  // Add owner as workspace member
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    console.error("Error adding owner as member:", memberError);
  }

  return workspace;
}

/**
 * Get all workspaces for the current user
 */
export async function getWorkspaces(): Promise<Workspace[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }

  const supabase = await createClient();

  // Get workspaces where user is a member
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

/**
 * Get a single workspace with its boards
 */
export async function getWorkspaceWithBoards(
  workspaceId: string
): Promise<WorkspaceWithBoards | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  // Check membership
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

  // Get workspace with boards
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

/**
 * Update a workspace
 */
export async function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput
): Promise<Workspace | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  // Check if user is owner or admin
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
    .update(input)
    .eq("id", workspaceId)
    .select()
    .single();

  if (error) {
    console.error("Error updating workspace:", error);
    return null;
  }

  return workspace;
}

/**
 * Delete a workspace (owner only)
 */
export async function deleteWorkspace(workspaceId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  const supabase = await createClient();

  // Check if user is owner
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

/**
 * Add a member to workspace
 */
export async function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: "admin" | "member" = "member"
): Promise<WorkspaceMember | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  // Check if current user is owner or admin
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

  return newMember;
}

/**
 * Remove a member from workspace
 */
export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  const supabase = await createClient();

  // Check if current user is owner or admin
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

  return true;
}

/**
 * Get all members of a workspace
 */
export async function getWorkspaceMembers(
  workspaceId: string
): Promise<{ id: string; name: string | null; email: string; avatar_url: string | null; role: string }[]> {
  const supabase = await createClient();

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
