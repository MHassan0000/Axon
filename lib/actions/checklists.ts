"use server";

import { createClient } from "@/lib/supabase/server";
import type { 
  Checklist, 
  ChecklistItem, 
  ChecklistWithItems 
} from "@/lib/types/database";

// Create a new checklist
export async function createChecklist(
  cardId: string,
  title: string = "Checklist"
): Promise<Checklist | null> {
  const supabase = await createClient();

  // Get max position for new checklist
  const { data: existing } = await supabase
    .from("checklists")
    .select("position")
    .eq("card_id", cardId)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from("checklists")
    .insert({ card_id: cardId, title, position })
    .select()
    .single();

  if (error) {
    console.error("Error creating checklist:", error);
    return null;
  }

  return data;
}

// Get checklists for a card
export async function getChecklists(cardId: string): Promise<ChecklistWithItems[]> {
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

  // Fetch items for each checklist
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

// Delete a checklist
export async function deleteChecklist(checklistId: string): Promise<boolean> {
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

// Update checklist title
export async function updateChecklist(
  checklistId: string,
  title: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("checklists")
    .update({ title })
    .eq("id", checklistId);

  if (error) {
    console.error("Error updating checklist:", error);
    return false;
  }

  return true;
}

// Add item to checklist
export async function addChecklistItem(
  checklistId: string,
  title: string
): Promise<ChecklistItem | null> {
  const supabase = await createClient();

  // Get max position
  const { data: existing } = await supabase
    .from("checklist_items")
    .select("position")
    .eq("checklist_id", checklistId)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from("checklist_items")
    .insert({ checklist_id: checklistId, title, position })
    .select()
    .single();

  if (error) {
    console.error("Error adding checklist item:", error);
    return null;
  }

  return data;
}

// Toggle checklist item completion
export async function toggleChecklistItem(
  itemId: string,
  isComplete: boolean
): Promise<boolean> {
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

// Delete checklist item
export async function deleteChecklistItem(itemId: string): Promise<boolean> {
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

// Update checklist item title
export async function updateChecklistItem(
  itemId: string,
  title: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist_items")
    .update({ title })
    .eq("id", itemId);

  if (error) {
    console.error("Error updating checklist item:", error);
    return false;
  }

  return true;
}
