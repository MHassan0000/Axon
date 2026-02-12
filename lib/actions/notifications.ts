"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import type { Notification } from "@/lib/types/database";

export type NotificationType =
  | "card_assigned"
  | "comment_added"
  | "due_soon"
  | "due_overdue"
  | "workspace_invite"
  | "mentioned"
  | "card_moved";

interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.user_id,
      type: input.type,
      title: input.title,
      message: input.message || null,
      link: input.link || null,
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getNotifications(
  limit = 20,
  offset = 0
): Promise<Notification[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return [];
  }

  return data || [];
}

export async function getUnreadCount(): Promise<number> {
  const user = await getCurrentUser();

  if (!user) {
    return 0;
  }

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return 0;
  }

  return count || 0;
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return !error;
}

export async function markAllAsRead(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return !error;
}

export async function deleteNotification(
  notificationId: string
): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return !error;
}

export async function clearAllNotifications(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id);

  return !error;
}

export async function notifyUsers(
  userIds: string[],
  notification: Omit<CreateNotificationInput, "user_id">
): Promise<void> {
  const supabase = await createClient();

  const notifications = userIds.map((user_id) => ({
    user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message || null,
    link: notification.link || null,
  }));

  await supabase.from("notifications").insert(notifications);
}
