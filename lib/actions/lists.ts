"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import { verifyBoardAccess, verifyListAccess } from "./helpers";
import { 
  validateInput, 
  createListSchema, 
  updateListSchema 
} from "@/lib/validations";
import { z } from "zod";
import type { 
  List, 
  CreateListInput,
  UpdateListInput 
} from "@/lib/types/database";

// Validation schema for reordering lists
const reorderListsSchema = z.object({
  boardId: z.string().uuid("Invalid board ID"),
  listIds: z.array(z.string().uuid("Invalid list ID")).min(1, "At least one list ID required"),
});

export async function createList(input: CreateListInput): Promise<List | null> {
  const validation = validateInput(createListSchema, input);
  if (!validation.success) {
    console.error("Validation failed:", validation.error);
    return null;
  }
  const validData = validation.data;

  const user = await getCurrentUser();
  
  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const access = await verifyBoardAccess(validData.board_id);
  if (!access.allowed) {
    console.error("User does not have access to this board");
    return null;
  }

  const supabase = await createClient();

  const { data: lastList } = await supabase
    .from("lists")
    .select("position")
    .eq("board_id", validData.board_id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = lastList ? lastList.position + 1 : 0;

  const { data: list, error } = await supabase
    .from("lists")
    .insert({
      board_id: validData.board_id,
      name: validData.name,
      color: validData.color || "#6366f1",
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

export async function updateList(
  listId: string,
  input: UpdateListInput
): Promise<List | null> {
  const idValidation = z.string().uuid("Invalid list ID").safeParse(listId);
  if (!idValidation.success) {
    console.error("Invalid list ID");
    return null;
  }

  const validation = validateInput(updateListSchema, input);
  if (!validation.success) {
    console.error("Validation failed:", validation.error);
    return null;
  }
  const validData = validation.data;

  const access = await verifyListAccess(listId);
  if (!access.allowed) {
    console.error("User does not have access to this list");
    return null;
  }

  const supabase = await createClient();

  const { data: list, error } = await supabase
    .from("lists")
    .update(validData)
    .eq("id", listId)
    .select()
    .single();

  if (error) {
    console.error("Error updating list:", error);
    return null;
  }

  return list;
}

export async function deleteList(listId: string): Promise<boolean> {
  const idValidation = z.string().uuid("Invalid list ID").safeParse(listId);
  if (!idValidation.success) {
    console.error("Invalid list ID");
    return false;
  }

  const access = await verifyListAccess(listId);
  if (!access.allowed) {
    console.error("User does not have access to this list");
    return false;
  }

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

export async function reorderLists(
  boardId: string,
  listIds: string[]
): Promise<boolean> {
  const validation = reorderListsSchema.safeParse({ boardId, listIds });
  if (!validation.success) {
    console.error("Validation failed:", validation.error.issues[0]?.message);
    return false;
  }

  const access = await verifyBoardAccess(boardId);
  if (!access.allowed) {
    console.error("User does not have access to this board");
    return false;
  }

  const supabase = await createClient();

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

export async function copyList(
  listId: string,
  newName?: string
): Promise<List | null> {
  const idValidation = z.string().uuid("Invalid list ID").safeParse(listId);
  if (!idValidation.success) {
    console.error("Invalid list ID");
    return null;
  }

  if (newName !== undefined) {
    const nameValidation = z.string().max(100, "List name must be 100 characters or less").safeParse(newName);
    if (!nameValidation.success) {
      console.error("Invalid list name:", nameValidation.error.issues[0]?.message);
      return null;
    }
  }

  const access = await verifyListAccess(listId);
  if (!access.allowed) {
    console.error("User does not have access to this list");
    return null;
  }

  const supabase = await createClient();

  const { data: originalList } = await supabase
    .from("lists")
    .select("*")
    .eq("id", listId)
    .single();

  if (!originalList) {
    return null;
  }

  const { data: lastList } = await supabase
    .from("lists")
    .select("position")
    .eq("board_id", originalList.board_id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = lastList ? lastList.position + 1 : 0;

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
