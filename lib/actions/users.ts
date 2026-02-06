"use server";

import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import type { User } from "@/lib/types/database";

/**
 * Sync the current Clerk user to Supabase
 * Call this after sign-in to ensure user exists in database
 */
export async function syncCurrentUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const supabase = await createClient();

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkUser.id)
    .single();

  if (existingUser) {
    // Update user if email or name changed
    if (
      existingUser.email !== clerkUser.emailAddresses[0]?.emailAddress ||
      existingUser.name !== `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      existingUser.avatar_url !== clerkUser.imageUrl
    ) {
      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({
          email: clerkUser.emailAddresses[0]?.emailAddress || existingUser.email,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || existingUser.name,
          avatar_url: clerkUser.imageUrl || existingUser.avatar_url,
        })
        .eq("clerk_id", clerkUser.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating user:", error);
        return existingUser;
      }

      return updatedUser;
    }

    return existingUser;
  }

  // Create new user
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      clerk_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
      avatar_url: clerkUser.imageUrl || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    return null;
  }

  return newUser;
}

/**
 * Get the current user from Supabase (must be synced first)
 */
export async function getCurrentUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkUser.id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return user;
}

/**
 * Get user by their Supabase ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return user;
}

/**
 * Search users by name or email (for assigning to cards)
 */
export async function searchUsers(query: string, limit = 10): Promise<User[]> {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error("Error searching users:", error);
    return [];
  }

  return users;
}
