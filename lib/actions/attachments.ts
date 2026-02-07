"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import { verifyCardAccess } from "./helpers";
import type { Attachment } from "@/lib/types/database";

const BUCKET_NAME = "attachments";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text
  "text/plain",
  "text/csv",
  "application/json",
  // Archives
  "application/zip",
  "application/x-rar-compressed",
];

/**
 * Upload a file attachment to a card
 */
export async function uploadAttachment(
  cardId: string,
  formData: FormData
): Promise<Attachment | null> {
  const user = await getCurrentUser();

  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return null;
  }

  const file = formData.get("file") as File;
  if (!file) {
    console.error("No file provided");
    return null;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    console.error("File too large");
    return null;
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    console.error("File type not allowed:", file.type);
    return null;
  }

  const supabase = await createClient();

  // Generate unique file path
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${cardId}/${timestamp}-${safeName}`;

  // Convert File to ArrayBuffer then to Uint8Array for upload
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, uint8Array, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  // Create attachment record
  const { data: attachment, error: dbError } = await supabase
    .from("attachments")
    .insert({
      card_id: cardId,
      name: file.name,
      url: urlData.publicUrl,
      type: file.type,
      size_bytes: file.size,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Error creating attachment record:", dbError);
    // Try to clean up uploaded file
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    return null;
  }

  // Log activity
  if (access.boardId) {
    await supabase.from("activity_log").insert({
      card_id: cardId,
      board_id: access.boardId,
      user_id: user.id,
      action: "attachment_added",
      details: { name: file.name },
    });
  }

  return attachment;
}

/**
 * Get all attachments for a card
 */
export async function getAttachments(cardId: string): Promise<Attachment[]> {
  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return [];
  }

  const supabase = await createClient();

  const { data: attachments, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching attachments:", error);
    return [];
  }

  return attachments || [];
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(attachmentId: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const supabase = await createClient();

  // Get the attachment
  const { data: attachment } = await supabase
    .from("attachments")
    .select("*, cards(list_id, lists(board_id))")
    .eq("id", attachmentId)
    .single();

  if (!attachment) {
    console.error("Attachment not found");
    return false;
  }

  // Verify user has access to this card
  const access = await verifyCardAccess(attachment.card_id);
  if (!access.allowed) {
    console.error("User does not have access to delete this attachment");
    return false;
  }

  // Extract file path from URL
  const urlParts = attachment.url.split(`/${BUCKET_NAME}/`);
  if (urlParts.length > 1) {
    const filePath = urlParts[1];
    // Delete from storage
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
  }

  // Delete from database
  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId);

  if (error) {
    console.error("Error deleting attachment:", error);
    return false;
  }

  return true;
}

/**
 * Upload attachment during card creation (before card has an ID)
 * Returns the file data to be uploaded after card is created
 */
export async function prepareAttachment(formData: FormData): Promise<{
  file: {
    name: string;
    type: string;
    size: number;
    data: string; // base64
  };
} | null> {
  const file = formData.get("file") as File;
  if (!file) {
    return null;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    console.error("File too large");
    return null;
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    console.error("File type not allowed:", file.type);
    return null;
  }

  // Convert to base64 for temporary storage
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return {
    file: {
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
    },
  };
}

/**
 * Upload a prepared attachment to a card (used after card creation)
 */
export async function uploadPreparedAttachment(
  cardId: string,
  fileData: {
    name: string;
    type: string;
    size: number;
    data: string;
  }
): Promise<Attachment | null> {
  const user = await getCurrentUser();

  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  // Verify user has access to this card
  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return null;
  }

  const supabase = await createClient();

  // Generate unique file path
  const timestamp = Date.now();
  const safeName = fileData.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${cardId}/${timestamp}-${safeName}`;

  // Convert base64 back to buffer
  const buffer = Buffer.from(fileData.data, "base64");

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: fileData.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  // Create attachment record
  const { data: attachment, error: dbError } = await supabase
    .from("attachments")
    .insert({
      card_id: cardId,
      name: fileData.name,
      url: urlData.publicUrl,
      type: fileData.type,
      size_bytes: fileData.size,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Error creating attachment record:", dbError);
    // Try to clean up uploaded file
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    return null;
  }

  return attachment;
}
