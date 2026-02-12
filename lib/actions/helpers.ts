"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";

type RoleType = "owner" | "admin" | "member";

interface AccessResult {
  allowed: boolean;
  role?: RoleType;
  userId?: string;
}

interface BoardAccessResult extends AccessResult {
  workspaceId?: string;
}

interface CardAccessResult extends AccessResult {
  workspaceId?: string;
  boardId?: string;
}

interface ListAccessResult extends AccessResult {
  workspaceId?: string;
  boardId?: string;
}

interface ChecklistAccessResult extends AccessResult {
  workspaceId?: string;
  boardId?: string;
  cardId?: string;
}

const roleHierarchy: Record<RoleType, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export async function verifyWorkspaceAccess(
  workspaceId: string,
  requiredRole?: RoleType
): Promise<AccessResult> {
  const user = await getCurrentUser();
  if (!user) return { allowed: false };

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership) return { allowed: false };

  const memberRole = membership.role as RoleType;

  if (requiredRole) {
    const hasRole = roleHierarchy[memberRole] >= roleHierarchy[requiredRole];
    return { allowed: hasRole, role: memberRole, userId: user.id };
  }

  return { allowed: true, role: memberRole, userId: user.id };
}

export async function verifyBoardAccess(
  boardId: string,
  requiredRole?: RoleType
): Promise<BoardAccessResult> {
  const user = await getCurrentUser();
  if (!user) return { allowed: false };

  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("workspace_id")
    .eq("id", boardId)
    .single();

  if (!board) return { allowed: false };

  const access = await verifyWorkspaceAccess(board.workspace_id, requiredRole);
  return { ...access, workspaceId: board.workspace_id };
}

export async function verifyListAccess(
  listId: string,
  requiredRole?: RoleType
): Promise<ListAccessResult> {
  const user = await getCurrentUser();
  if (!user) return { allowed: false };

  const supabase = await createClient();

  const { data: list } = await supabase
    .from("lists")
    .select("board_id, boards!inner(workspace_id)")
    .eq("id", listId)
    .single();

  if (!list) return { allowed: false };

  const boardData = list as unknown as {
    board_id: string;
    boards: { workspace_id: string };
  };

  const access = await verifyWorkspaceAccess(
    boardData.boards.workspace_id,
    requiredRole
  );
  return {
    ...access,
    workspaceId: boardData.boards.workspace_id,
    boardId: boardData.board_id,
  };
}

export async function verifyCardAccess(
  cardId: string,
  requiredRole?: RoleType
): Promise<CardAccessResult> {
  const user = await getCurrentUser();
  if (!user) return { allowed: false };

  const supabase = await createClient();

  const { data: card } = await supabase
    .from("cards")
    .select("*, lists!inner(board_id, boards!inner(workspace_id))")
    .eq("id", cardId)
    .single();

  if (!card) return { allowed: false };

  const cardData = card as unknown as {
    lists: { board_id: string; boards: { workspace_id: string } };
  };

  const workspaceId = cardData.lists.boards.workspace_id;
  const boardId = cardData.lists.board_id;

  const access = await verifyWorkspaceAccess(workspaceId, requiredRole);
  return { ...access, workspaceId, boardId };
}

export async function verifyChecklistAccess(
  checklistId: string,
  requiredRole?: RoleType
): Promise<ChecklistAccessResult> {
  const user = await getCurrentUser();
  if (!user) return { allowed: false };

  const supabase = await createClient();

  const { data: checklist } = await supabase
    .from("checklists")
    .select(
      "card_id, cards!inner(list_id, lists!inner(board_id, boards!inner(workspace_id)))"
    )
    .eq("id", checklistId)
    .single();

  if (!checklist) return { allowed: false };

  const checklistData = checklist as unknown as {
    card_id: string;
    cards: {
      list_id: string;
      lists: { board_id: string; boards: { workspace_id: string } };
    };
  };

  const workspaceId = checklistData.cards.lists.boards.workspace_id;
  const boardId = checklistData.cards.lists.board_id;
  const cardId = checklistData.card_id;

  const access = await verifyWorkspaceAccess(workspaceId, requiredRole);
  return { ...access, workspaceId, boardId, cardId };
}

export async function verifyChecklistItemAccess(
  itemId: string,
  requiredRole?: RoleType
): Promise<ChecklistAccessResult> {
  const user = await getCurrentUser();
  if (!user) return { allowed: false };

  const supabase = await createClient();

  const { data: item } = await supabase
    .from("checklist_items")
    .select(
      "checklist_id, checklists!inner(card_id, cards!inner(list_id, lists!inner(board_id, boards!inner(workspace_id))))"
    )
    .eq("id", itemId)
    .single();

  if (!item) return { allowed: false };

  const itemData = item as unknown as {
    checklist_id: string;
    checklists: {
      card_id: string;
      cards: {
        list_id: string;
        lists: { board_id: string; boards: { workspace_id: string } };
      };
    };
  };

  const workspaceId = itemData.checklists.cards.lists.boards.workspace_id;
  const boardId = itemData.checklists.cards.lists.board_id;
  const cardId = itemData.checklists.card_id;

  const access = await verifyWorkspaceAccess(workspaceId, requiredRole);
  return { ...access, workspaceId, boardId, cardId };
}
