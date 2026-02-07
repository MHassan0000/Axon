"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import { verifyWorkspaceAccess, verifyBoardAccess } from "./helpers";
import { canCreateBoard } from "@/lib/billing";
import { 
  validateInput, 
  createBoardSchema, 
  updateBoardSchema,
  createLabelSchema 
} from "@/lib/validations";
import { z } from "zod";
import type { 
  Board, 
  BoardWithLists,
  CreateBoardInput,
  UpdateBoardInput,
  Label
} from "@/lib/types/database";

/**
 * Create a new board
 */
export async function createBoard(input: CreateBoardInput): Promise<{ board: Board | null; error?: string }> {
  // Validate input
  const validation = validateInput(createBoardSchema, input);
  if (!validation.success) {
    return { board: null, error: validation.error };
  }
  const validData = validation.data;

  const user = await getCurrentUser();
  
  if (!user) {
    return { board: null, error: "User not authenticated" };
  }

  const supabase = await createClient();

  // Check if user is a member of the workspace
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", validData.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return { board: null, error: "Not a member of this workspace" };
  }

  // Check plan limits - count existing boards in this workspace
  const { count: boardCount } = await supabase
    .from("boards")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", validData.workspace_id);

  const canCreate = await canCreateBoard(boardCount || 0);
  if (!canCreate.allowed) {
    return { board: null, error: canCreate.reason };
  }

  // Get the next position
  const { data: lastBoard } = await supabase
    .from("boards")
    .select("position")
    .eq("workspace_id", validData.workspace_id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = lastBoard ? lastBoard.position + 1 : 0;

  const { data: board, error } = await supabase
    .from("boards")
    .insert({
      workspace_id: validData.workspace_id,
      name: validData.name,
      description: validData.description || null,
      is_private: false,
      background_color: validData.background_color || "#1f1f23",
      position,
    })
    .select()
    .single();

  if (error) {
    return { board: null, error: "Failed to create board" };
  }

  // Create default labels for the board
  const defaultLabels = [
    { name: "Bug", color: "#ef4444" },
    { name: "Feature", color: "#22c55e" },
    { name: "Improvement", color: "#3b82f6" },
    { name: "Urgent", color: "#f97316" },
    { name: "Question", color: "#8b5cf6" },
  ];

  await supabase.from("labels").insert(
    defaultLabels.map((label) => ({
      board_id: board.id,
      name: label.name,
      color: label.color,
    }))
  );

  return { board };
}

/**
 * Get all boards for a workspace
 */
export async function getBoards(workspaceId: string): Promise<Board[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
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
    return [];
  }

  const { data: boards, error } = await supabase
    .from("boards")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching boards:", error);
    return [];
  }

  return boards;
}

/**
 * Get a single board with all lists and cards
 */
export async function getBoardWithLists(boardId: string): Promise<BoardWithLists | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  // Get board
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .single();

  if (boardError || !board) {
    console.error("Error fetching board:", boardError);
    return null;
  }

  // Check membership
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", board.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    console.error("User is not a member of this workspace");
    return null;
  }

  // Get lists with cards
  const { data: lists, error: listsError } = await supabase
    .from("lists")
    .select("*")
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (listsError) {
    console.error("Error fetching lists:", listsError);
    return null;
  }

  // Get all cards for these lists
  const listIds = lists.map((l) => l.id);
  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .in("list_id", listIds)
    .order("position", { ascending: true });

  // Get labels for the board
  const { data: labels } = await supabase
    .from("labels")
    .select("*")
    .eq("board_id", boardId);

  // Get card IDs for fetching related data
  const cardIds = cards?.map((c) => c.id) || [];

  // Fetch all related data in parallel for better performance
  const [cardLabelsResult, cardAssigneesResult, commentsCountResult, attachmentsCountResult] = await Promise.all([
    // Card labels
    supabase
      .from("card_labels")
      .select("*")
      .in("card_id", cardIds),
    // Card assignees with user info
    supabase
      .from("card_assignees")
      .select("*, users(*)")
      .in("card_id", cardIds),
    // Comments count per card
    supabase
      .from("comments")
      .select("card_id")
      .in("card_id", cardIds),
    // Attachments count per card
    supabase
      .from("attachments")
      .select("card_id")
      .in("card_id", cardIds),
  ]);

  const cardLabels = cardLabelsResult.data || [];
  const cardAssignees = cardAssigneesResult.data || [];
  const comments = commentsCountResult.data || [];
  const attachments = attachmentsCountResult.data || [];

  // Calculate counts per card
  const commentsCountMap = new Map<string, number>();
  comments.forEach((c) => {
    commentsCountMap.set(c.card_id, (commentsCountMap.get(c.card_id) || 0) + 1);
  });

  const attachmentsCountMap = new Map<string, number>();
  attachments.forEach((a) => {
    attachmentsCountMap.set(a.card_id, (attachmentsCountMap.get(a.card_id) || 0) + 1);
  });

  // Organize cards by list with their relations
  const listsWithCards = lists.map((list) => ({
    ...list,
    cards: (cards || [])
      .filter((card) => card.list_id === list.id)
      .map((card) => ({
        ...card,
        labels: cardLabels
          .filter((cl) => cl.card_id === card.id)
          .map((cl) => labels?.find((l) => l.id === cl.label_id))
          .filter(Boolean),
        assignees: cardAssignees
          .filter((ca) => ca.card_id === card.id)
          .map((ca) => ca.users)
          .filter(Boolean),
        comments_count: commentsCountMap.get(card.id) || 0,
        attachments_count: attachmentsCountMap.get(card.id) || 0,
      })),
  }));

  return {
    ...board,
    lists: listsWithCards,
    labels: labels || [],
  };
}

/**
 * Update a board
 */
export async function updateBoard(
  boardId: string,
  input: UpdateBoardInput
): Promise<Board | null> {
  // Validate boardId
  const idValidation = z.string().uuid("Invalid board ID").safeParse(boardId);
  if (!idValidation.success) {
    console.error("Invalid board ID");
    return null;
  }

  // Validate input
  const validation = validateInput(updateBoardSchema, input);
  if (!validation.success) {
    console.error("Validation failed:", validation.error);
    return null;
  }
  const validData = validation.data;

  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Verify user has access to this board (member or higher)
  const access = await verifyBoardAccess(boardId);
  if (!access.allowed) {
    console.error("User does not have access to this board");
    return null;
  }

  const supabase = await createClient();

  const { data: board, error } = await supabase
    .from("boards")
    .update(validData)
    .eq("id", boardId)
    .select()
    .single();

  if (error) {
    console.error("Error updating board:", error);
    return null;
  }

  return board;
}

/**
 * Delete a board
 */
export async function deleteBoard(boardId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Verify user has admin or owner access to delete the board
  const access = await verifyBoardAccess(boardId, "admin");
  if (!access.allowed) {
    console.error("User does not have permission to delete this board");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("boards")
    .delete()
    .eq("id", boardId);

  if (error) {
    console.error("Error deleting board:", error);
    return false;
  }

  return true;
}

/**
 * Create a label for a board
 */
export async function createLabel(
  boardId: string,
  name: string,
  color: string
): Promise<Label | null> {
  // Validate input
  const validation = validateInput(createLabelSchema, { board_id: boardId, name, color });
  if (!validation.success) {
    console.error("Validation failed:", validation.error);
    return null;
  }

  // Verify user has access to this board
  const access = await verifyBoardAccess(boardId);
  if (!access.allowed) {
    console.error("User does not have access to this board");
    return null;
  }

  const supabase = await createClient();

  const { data: label, error } = await supabase
    .from("labels")
    .insert({
      board_id: boardId,
      name,
      color,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating label:", error);
    return null;
  }

  return label;
}

/**
 * Delete a label
 */
export async function deleteLabel(labelId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get the label to find the board
  const { data: label } = await supabase
    .from("labels")
    .select("board_id")
    .eq("id", labelId)
    .single();

  if (!label) {
    return false;
  }

  // Verify user has access to this board
  const access = await verifyBoardAccess(label.board_id);
  if (!access.allowed) {
    console.error("User does not have access to this board");
    return false;
  }

  const { error } = await supabase
    .from("labels")
    .delete()
    .eq("id", labelId);

  if (error) {
    console.error("Error deleting label:", error);
    return false;
  }

  return true;
}
