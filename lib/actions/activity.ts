"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import type { ActivityLog } from "@/lib/types/database";

// Log an activity
export async function logActivity(
  action: string,
  cardId?: string,
  boardId?: string,
  details?: Record<string, unknown>
): Promise<ActivityLog | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    console.error("No user found for activity log");
    return null;
  }

  const { data, error } = await supabase
    .from("activity_log")
    .insert({
      user_id: user.id,
      card_id: cardId || null,
      board_id: boardId || null,
      action,
      details: details || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error logging activity:", error);
    return null;
  }

  return data;
}

// Get recent activity for a user's workspaces
export async function getRecentActivity(limit: number = 50): Promise<(ActivityLog & { user: { name: string; avatar_url: string } })[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return [];

  // Get user's workspaces
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) return [];

  const workspaceIds = memberships.map((m) => m.workspace_id);

  // Get boards in those workspaces
  const { data: boards } = await supabase
    .from("boards")
    .select("id")
    .in("workspace_id", workspaceIds);

  if (!boards || boards.length === 0) return [];

  const boardIds = boards.map((b) => b.id);

  // Get activity for those boards
  const { data: activities, error } = await supabase
    .from("activity_log")
    .select(`
      *,
      user:users!activity_log_user_id_fkey(name, avatar_url)
    `)
    .in("board_id", boardIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching activity:", error);
    return [];
  }

  return activities || [];
}

// Get activity for a specific card
export async function getCardActivity(cardId: string): Promise<(ActivityLog & { user: { name: string; avatar_url: string } })[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select(`
      *,
      user:users!activity_log_user_id_fkey(name, avatar_url)
    `)
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching card activity:", error);
    return [];
  }

  return data || [];
}

// Get activity for a specific board
export async function getBoardActivity(boardId: string, limit: number = 20): Promise<(ActivityLog & { user: { name: string; avatar_url: string } })[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select(`
      *,
      user:users!activity_log_user_id_fkey(name, avatar_url)
    `)
    .eq("board_id", boardId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching board activity:", error);
    return [];
  }

  return data || [];
}
