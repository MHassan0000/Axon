"use server";

import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import type { User } from "@/lib/types/database";

export async function syncCurrentUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const supabase = await createClient();

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkUser.id)
    .single();

  if (existingUser) {
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

  if (error || !user) {
    // User not found in database, sync from Clerk
    return await syncCurrentUser();
  }

  return user;
}

export async function searchUsers(query: string, limit = 10): Promise<User[]> {
  // Require authentication to search users
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    console.error("User not authenticated");
    return [];
  }

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
