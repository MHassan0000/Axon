"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import type { 
  List, 
  CreateListInput,
  UpdateListInput 
} from "@/lib/types/database";

/**
 * Create a new list (column)
 */
export async function createList(input: CreateListInput): Promise<List | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const supabase = await createClient();

  // Get the next position
  const { data: lastList } = await supabase
    .from("lists")
    .select("position")
    .eq("board_id", input.board_id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = lastList ? lastList.position + 1 : 0;

  const { data: list, error } = await supabase
    .from("lists")
    .insert({
      board_id: input.board_id,
      name: input.name,
      color: input.color || "#6366f1",
      position,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating list:", error);
    return null;
  }

  return list;
}

/**
 * Update a list
 */
export async function updateList(
  listId: string,
  input: UpdateListInput
): Promise<List | null> {
  const supabase = await createClient();

  const { data: list, error } = await supabase
    .from("lists")
    .update(input)
    .eq("id", listId)
    .select()
    .single();

  if (error) {
    console.error("Error updating list:", error);
    return null;
  }

  return list;
}

/**
 * Delete a list
 */
export async function deleteList(listId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId);

  if (error) {
    console.error("Error deleting list:", error);
    return false;
  }

  return true;
}

/**
 * Reorder lists within a board
 */
export async function reorderLists(
  boardId: string,
  listIds: string[]
): Promise<boolean> {
  const supabase = await createClient();

  // Update each list's position
  const updates = listIds.map((id, index) => 
    supabase
      .from("lists")
      .update({ position: index })
      .eq("id", id)
      .eq("board_id", boardId)
  );

  try {
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error("Error reordering lists:", error);
    return false;
  }
}

/**
 * Copy a list with all its cards
 */
export async function copyList(
  listId: string,
  newName?: string
): Promise<List | null> {
  const supabase = await createClient();

  // Get the original list
  const { data: originalList } = await supabase
    .from("lists")
    .select("*")
    .eq("id", listId)
    .single();

  if (!originalList) {
    return null;
  }

  // Get the next position
  const { data: lastList } = await supabase
    .from("lists")
    .select("position")
    .eq("board_id", originalList.board_id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = lastList ? lastList.position + 1 : 0;

  // Create the new list
  const { data: newList, error: listError } = await supabase
    .from("lists")
    .insert({
      board_id: originalList.board_id,
      name: newName || `${originalList.name} (copy)`,
      color: originalList.color,
      position,
    })
    .select()
    .single();

  if (listError || !newList) {
    console.error("Error copying list:", listError);
    return null;
  }

  // Get cards from original list
  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("list_id", listId)
    .order("position", { ascending: true });

  if (cards && cards.length > 0) {
    // Copy cards to new list
    await supabase.from("cards").insert(
      cards.map((card, index) => ({
        list_id: newList.id,
        title: card.title,
        description: card.description,
        position: index,
        due_date: card.due_date,
      }))
    );
  }

  return newList;
}
