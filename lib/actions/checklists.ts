"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import { verifyCardAccess, verifyChecklistAccess, verifyChecklistItemAccess } from "./helpers";
import { 
  checklistTitleSchema, 
  checklistItemTitleSchema 
} from "@/lib/validations";
import { z } from "zod";
import type { 
  Checklist, 
  ChecklistItem, 
  ChecklistWithItems 
} from "@/lib/types/database";

export async function createChecklist(
  cardId: string,
  title: string = "Checklist"
): Promise<Checklist | null> {
  const cardIdValidation = z.string().uuid("Invalid card ID").safeParse(cardId);
  if (!cardIdValidation.success) {
    console.error("Invalid card ID");
    return null;
  }

  const titleValidation = checklistTitleSchema.safeParse(title);
  if (!titleValidation.success) {
    console.error("Validation failed:", titleValidation.error.issues[0]?.message);
    return null;
  }
  const validTitle = titleValidation.data;

  const user = await getCurrentUser();
  
  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return null;
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("checklists")
    .select("position")
    .eq("card_id", cardId)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from("checklists")
    .insert({ card_id: cardId, title: validTitle, position })
    .select()
    .single();

  if (error) {
    console.error("Error creating checklist:", error);
    return null;
  }

  return data;
}

export async function getChecklists(cardId: string): Promise<ChecklistWithItems[]> {
  const cardIdValidation = z.string().uuid("Invalid card ID").safeParse(cardId);
  if (!cardIdValidation.success) {
    console.error("Invalid card ID");
    return [];
  }

  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return [];
  }

  const supabase = await createClient();

  const { data: checklists, error } = await supabase
    .from("checklists")
    .select("*")
    .eq("card_id", cardId)
    .order("position");

  if (error || !checklists) {
    console.error("Error fetching checklists:", error);
    return [];
  }

  const checklistsWithItems: ChecklistWithItems[] = await Promise.all(
    checklists.map(async (checklist) => {
      const { data: items } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("checklist_id", checklist.id)
        .order("position");

      return {
        ...checklist,
        items: items || [],
      };
    })
  );

  return checklistsWithItems;
}

export async function deleteChecklist(checklistId: string): Promise<boolean> {
  const idValidation = z.string().uuid("Invalid checklist ID").safeParse(checklistId);
  if (!idValidation.success) {
    console.error("Invalid checklist ID");
    return false;
  }

  const access = await verifyChecklistAccess(checklistId);
  if (!access.allowed) {
    console.error("User does not have access to this checklist");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("checklists")
    .delete()
    .eq("id", checklistId);

  if (error) {
    console.error("Error deleting checklist:", error);
    return false;
  }

  return true;
}

export async function updateChecklist(
  checklistId: string,
  title: string
): Promise<boolean> {
  const idValidation = z.string().uuid("Invalid checklist ID").safeParse(checklistId);
  if (!idValidation.success) {
    console.error("Invalid checklist ID");
    return false;
  }

  const titleValidation = checklistTitleSchema.safeParse(title);
  if (!titleValidation.success) {
    console.error("Validation failed:", titleValidation.error.issues[0]?.message);
    return false;
  }
  const validTitle = titleValidation.data;

  const access = await verifyChecklistAccess(checklistId);
  if (!access.allowed) {
    console.error("User does not have access to this checklist");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("checklists")
    .update({ title: validTitle })
    .eq("id", checklistId);

  if (error) {
    console.error("Error updating checklist:", error);
    return false;
  }

  return true;
}

export async function addChecklistItem(
  checklistId: string,
  title: string
): Promise<ChecklistItem | null> {
  const idValidation = z.string().uuid("Invalid checklist ID").safeParse(checklistId);
  if (!idValidation.success) {
    console.error("Invalid checklist ID");
    return null;
  }

  const titleValidation = checklistItemTitleSchema.safeParse(title);
  if (!titleValidation.success) {
    console.error("Validation failed:", titleValidation.error.issues[0]?.message);
    return null;
  }
  const validTitle = titleValidation.data;

  const access = await verifyChecklistAccess(checklistId);
  if (!access.allowed) {
    console.error("User does not have access to this checklist");
    return null;
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("checklist_items")
    .select("position")
    .eq("checklist_id", checklistId)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from("checklist_items")
    .insert({ checklist_id: checklistId, title: validTitle, position })
    .select()
    .single();

  if (error) {
    console.error("Error adding checklist item:", error);
    return null;
  }

  return data;
}

export async function toggleChecklistItem(
  itemId: string,
  isComplete: boolean
): Promise<boolean> {
  const idValidation = z.string().uuid("Invalid item ID").safeParse(itemId);
  if (!idValidation.success) {
    console.error("Invalid checklist item ID");
    return false;
  }

  const boolValidation = z.boolean().safeParse(isComplete);
  if (!boolValidation.success) {
    console.error("Invalid isComplete value");
    return false;
  }

  const access = await verifyChecklistItemAccess(itemId);
  if (!access.allowed) {
    console.error("User does not have access to this checklist item");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist_items")
    .update({ is_complete: isComplete })
    .eq("id", itemId);

  if (error) {
    console.error("Error toggling checklist item:", error);
    return false;
  }

  return true;
}

export async function deleteChecklistItem(itemId: string): Promise<boolean> {
  const idValidation = z.string().uuid("Invalid item ID").safeParse(itemId);
  if (!idValidation.success) {
    console.error("Invalid checklist item ID");
    return false;
  }

  const access = await verifyChecklistItemAccess(itemId);
  if (!access.allowed) {
    console.error("User does not have access to this checklist item");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Error deleting checklist item:", error);
    return false;
  }

  return true;
}

export async function updateChecklistItem(
  itemId: string,
  title: string
): Promise<boolean> {
  const idValidation = z.string().uuid("Invalid item ID").safeParse(itemId);
  if (!idValidation.success) {
    console.error("Invalid checklist item ID");
    return false;
  }

  const titleValidation = checklistItemTitleSchema.safeParse(title);
  if (!titleValidation.success) {
    console.error("Validation failed:", titleValidation.error.issues[0]?.message);
    return false;
  }
  const validTitle = titleValidation.data;

  const access = await verifyChecklistItemAccess(itemId);
  if (!access.allowed) {
    console.error("User does not have access to this checklist item");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist_items")
    .update({ title: validTitle })
    .eq("id", itemId);

  if (error) {
    console.error("Error updating checklist item:", error);
    return false;
  }

  return true;
}
