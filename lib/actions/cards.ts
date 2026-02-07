"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import { verifyListAccess, verifyCardAccess } from "./helpers";
import type { 
  Card, 
  CardWithRelations,
  CreateCardInput,
  UpdateCardInput,
  Comment,
  CreateCommentInput
} from "@/lib/types/database";

/**
 * Create a new card
 */
export async function createCard(input: CreateCardInput): Promise<Card | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  // Verify user has access to the list's workspace
  const access = await verifyListAccess(input.list_id);
  if (!access.allowed) {
    console.error("User does not have access to this list");
    return null;
  }

  const supabase = await createClient();

  // Get the next position in the list
  const { data: lastCard } = await supabase
    .from("cards")
    .select("position")
    .eq("list_id", input.list_id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = lastCard ? lastCard.position + 1 : 0;

  const { data: card, error } = await supabase
    .from("cards")
    .insert({
      list_id: input.list_id,
      title: input.title,
      description: input.description || null,
      due_date: input.due_date || null,
      position,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating card:", error);
    return null;
  }

  // Log activity
  const { data: list } = await supabase
    .from("lists")
    .select("board_id")
    .eq("id", input.list_id)
    .single();

  if (list) {
    await supabase.from("activity_log").insert({
      card_id: card.id,
      board_id: list.board_id,
      user_id: user.id,
      action: "created",
      details: { title: card.title },
    });
  }

  return card;
}

/**
 * Get a card with all its relations
 */
export async function getCard(cardId: string): Promise<CardWithRelations | null> {
  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return null;
  }

  const supabase = await createClient();

  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", cardId)
    .single();

  if (error || !card) {
    console.error("Error fetching card:", error);
    return null;
  }

  // Get labels
  const { data: cardLabels } = await supabase
    .from("card_labels")
    .select("*, labels(*)")
    .eq("card_id", cardId);

  // Get assignees
  const { data: cardAssignees } = await supabase
    .from("card_assignees")
    .select("*, users(*)")
    .eq("card_id", cardId);

  // Get comment count
  const { count: commentsCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("card_id", cardId);

  // Get attachment count
  const { count: attachmentsCount } = await supabase
    .from("attachments")
    .select("*", { count: "exact", head: true })
    .eq("card_id", cardId);

  return {
    ...card,
    labels: cardLabels?.map((cl) => cl.labels).filter(Boolean) || [],
    assignees: cardAssignees?.map((ca) => ca.users).filter(Boolean) || [],
    comments_count: commentsCount || 0,
    attachments_count: attachmentsCount || 0,
  };
}

/**
 * Update a card
 */
export async function updateCard(
  cardId: string,
  input: UpdateCardInput
): Promise<Card | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return null;
  }

  const supabase = await createClient();

  // Get original card for activity logging
  const { data: originalCard } = await supabase
    .from("cards")
    .select("*")
    .eq("id", cardId)
    .single();

  // If moving to a different list, verify access to the target list
  if (input.list_id) {
    const targetListAccess = await verifyListAccess(input.list_id);
    if (!targetListAccess.allowed) {
      console.error("User does not have access to the target list");
      return null;
    }

    const { data: lastCard } = await supabase
      .from("cards")
      .select("position")
      .eq("list_id", input.list_id)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    input.position = lastCard ? lastCard.position + 1 : 0;
  }

  const { data: card, error } = await supabase
    .from("cards")
    .update(input)
    .eq("id", cardId)
    .select()
    .single();

  if (error) {
    console.error("Error updating card:", error);
    return null;
  }

  // Log activity for specific changes
  if (access.boardId && originalCard) {
    const changes: string[] = [];
    
    if (input.title !== undefined && input.title !== originalCard.title) {
      changes.push("title");
    }
    if (input.description !== undefined && input.description !== originalCard.description) {
      changes.push("description");
    }
    if (input.due_date !== undefined && input.due_date !== originalCard.due_date) {
      changes.push("due date");
    }
    if (input.is_complete !== undefined && input.is_complete !== originalCard.is_complete) {
      await supabase.from("activity_log").insert({
        card_id: cardId,
        board_id: access.boardId,
        user_id: user.id,
        action: input.is_complete ? "completed" : "uncompleted",
        details: { title: card.title },
      });
    } else if (changes.length > 0) {
      await supabase.from("activity_log").insert({
        card_id: cardId,
        board_id: access.boardId,
        user_id: user.id,
        action: "updated",
        details: { changes, title: card.title },
      });
    }
  }

  return card;
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: string): Promise<boolean> {
  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to delete this card");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", cardId);

  if (error) {
    console.error("Error deleting card:", error);
    return false;
  }

  return true;
}

/**
 * Move a card to a different list and/or position
 */
export async function moveCard(
  cardId: string,
  toListId: string,
  position: number
): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Verify user has access to the card
  const cardAccess = await verifyCardAccess(cardId);
  if (!cardAccess.allowed) {
    console.error("User does not have access to this card");
    return false;
  }

  // Verify user has access to the target list
  const listAccess = await verifyListAccess(toListId);
  if (!listAccess.allowed) {
    console.error("User does not have access to the target list");
    return false;
  }

  const supabase = await createClient();

  // Get original card info for activity log
  const { data: originalCard } = await supabase
    .from("cards")
    .select("*, lists(name, board_id)")
    .eq("id", cardId)
    .single();

  // Update the card's list and position
  const { error } = await supabase
    .from("cards")
    .update({ list_id: toListId, position })
    .eq("id", cardId);

  if (error) {
    console.error("Error moving card:", error);
    return false;
  }

  // Get new list name for activity log
  const { data: newList } = await supabase
    .from("lists")
    .select("name, board_id")
    .eq("id", toListId)
    .single();

  // Log activity if list changed
  if (originalCard?.list_id !== toListId && newList) {
    await supabase.from("activity_log").insert({
      card_id: cardId,
      board_id: newList.board_id,
      user_id: user.id,
      action: "moved",
      details: {
        from: originalCard?.lists?.name,
        to: newList.name,
      },
    });

    // Notify card assignees about the move (except the mover)
    const { data: assignees } = await supabase
      .from("card_assignees")
      .select("user_id")
      .eq("card_id", cardId);

    if (assignees && assignees.length > 0) {
      const usersToNotify = assignees
        .map((a) => a.user_id)
        .filter((id) => id !== user.id);

      if (usersToNotify.length > 0) {
        const notifications = usersToNotify.map((userId) => ({
          user_id: userId,
          type: "card_moved",
          title: "Card moved",
          message: `"${originalCard?.title}" was moved from "${originalCard?.lists?.name}" to "${newList.name}"`,
          link: `/dashboard/board/${newList.board_id}?card=${cardId}`,
        }));

        await supabase.from("notifications").insert(notifications);
      }
    }
  }

  return true;
}

/**
 * Reorder cards within a list
 */
export async function reorderCards(
  listId: string,
  cardIds: string[]
): Promise<boolean> {
  // Verify user has access to the list
  const access = await verifyListAccess(listId);
  if (!access.allowed) {
    console.error("User does not have access to this list");
    return false;
  }

  const supabase = await createClient();

  const updates = cardIds.map((id, index) =>
    supabase
      .from("cards")
      .update({ position: index })
      .eq("id", id)
      .eq("list_id", listId)
  );

  try {
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error("Error reordering cards:", error);
    return false;
  }
}

/**
 * Add a label to a card
 */
export async function addLabelToCard(
  cardId: string,
  labelId: string
): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("card_labels")
    .insert({ card_id: cardId, label_id: labelId });

  if (error) {
    console.error("Error adding label:", error);
    return false;
  }

  // Log activity
  if (access.boardId) {
    const { data: label } = await supabase
      .from("labels")
      .select("name, color")
      .eq("id", labelId)
      .single();

    const { data: card } = await supabase
      .from("cards")
      .select("title")
      .eq("id", cardId)
      .single();

    await supabase.from("activity_log").insert({
      card_id: cardId,
      board_id: access.boardId,
      user_id: user.id,
      action: "label_added",
      details: { label: label?.name || "Unknown", cardTitle: card?.title },
    });
  }

  return true;
}

/**
 * Remove a label from a card
 */
export async function removeLabelFromCard(
  cardId: string,
  labelId: string
): Promise<boolean> {
  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("card_labels")
    .delete()
    .eq("card_id", cardId)
    .eq("label_id", labelId);

  if (error) {
    console.error("Error removing label:", error);
    return false;
  }

  return true;
}

/**
 * Assign a user to a card
 */
export async function assignUserToCard(
  cardId: string,
  userId: string
): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("card_assignees")
    .insert({ card_id: cardId, user_id: userId });

  if (error) {
    console.error("Error assigning user:", error);
    return false;
  }

  // Get user and card info for logging/notification
  const { data: assignedUser } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  const { data: card } = await supabase
    .from("cards")
    .select("title")
    .eq("id", cardId)
    .single();

  // Log activity
  if (access.boardId) {
    await supabase.from("activity_log").insert({
      card_id: cardId,
      board_id: access.boardId,
      user_id: user.id,
      action: "assigned",
      details: { 
        assignee: assignedUser?.name || "Unknown",
        cardTitle: card?.title 
      },
    });
  }

  // Create notification for the assigned user (if not self-assigning)
  if (access.userId && access.userId !== userId && card) {
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "card_assigned",
      title: "You were assigned to a card",
      message: `${user.name || "Someone"} assigned you to "${card.title}"`,
      link: `/dashboard/board/${access.boardId}?card=${cardId}`,
    });
  }

  return true;
}

/**
 * Unassign a user from a card
 */
export async function unassignUserFromCard(
  cardId: string,
  userId: string
): Promise<boolean> {
  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return false;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("card_assignees")
    .delete()
    .eq("card_id", cardId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error unassigning user:", error);
    return false;
  }

  return true;
}

/**
 * Add a comment to a card
 */
export async function addComment(input: CreateCommentInput): Promise<Comment | null> {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  // Verify user has access to this card
  const access = await verifyCardAccess(input.card_id);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return null;
  }

  const supabase = await createClient();

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      card_id: input.card_id,
      user_id: user.id,
      content: input.content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return null;
  }

  // Log activity
  if (access.boardId) {
    await supabase.from("activity_log").insert({
      card_id: input.card_id,
      board_id: access.boardId,
      user_id: user.id,
      action: "commented",
      details: { preview: input.content.slice(0, 50) },
    });
  }

  // Notify card assignees about the comment (except the commenter)
  const { data: assignees } = await supabase
    .from("card_assignees")
    .select("user_id")
    .eq("card_id", input.card_id);

  if (assignees && assignees.length > 0) {
    const { data: card } = await supabase
      .from("cards")
      .select("title")
      .eq("id", input.card_id)
      .single();

    const usersToNotify = assignees
      .map((a) => a.user_id)
      .filter((id) => id !== user.id);

    if (usersToNotify.length > 0 && card) {
      const notifications = usersToNotify.map((userId) => ({
        user_id: userId,
        type: "comment_added",
        title: "New comment on your card",
        message: `${user.name || "Someone"} commented on "${card.title}": "${input.content.slice(0, 50)}${input.content.length > 50 ? "..." : ""}"`,
        link: `/dashboard/board/${access.boardId}?card=${input.card_id}`,
      }));

      await supabase.from("notifications").insert(notifications);
    }
  }

  return comment;
}

/**
 * Get comments for a card
 */
export async function getComments(cardId: string): Promise<(Comment & { user: { name: string; avatar_url: string } })[]> {
  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card's comments");
    return [];
  }

  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("comments")
    .select("*, users(name, avatar_url)")
    .eq("card_id", cardId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return comments.map((c) => ({
    ...c,
    user: c.users,
  }));
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  const supabase = await createClient();

  // Get the comment to verify access
  const { data: comment } = await supabase
    .from("comments")
    .select("card_id, user_id")
    .eq("id", commentId)
    .single();

  if (!comment) {
    return false;
  }

  // Verify user has access to this card's workspace
  const access = await verifyCardAccess(comment.card_id);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return false;
  }

  // Only allow deleting own comments (unless admin/owner)
  if (comment.user_id !== user.id && access.role === "member") {
    console.error("User can only delete their own comments");
    return false;
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
    return false;
  }

  return true;
}
