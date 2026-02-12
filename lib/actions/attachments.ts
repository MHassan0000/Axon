"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";
import { verifyCardAccess } from "./helpers";
import type { Attachment } from "@/lib/types/database";

const BUCKET_NAME = "attachments";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/json",
  "application/zip",
  "application/x-rar-compressed",
];

export async function uploadAttachment(
  cardId: string,
  formData: FormData
): Promise<Attachment | null> {
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

  const file = formData.get("file") as File;
  if (!file) {
    console.error("No file provided");
    return null;
  }

  if (file.size > MAX_FILE_SIZE) {
    console.error("File too large");
    return null;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    console.error("File type not allowed:", file.type);
    return null;
  }

  const supabase = await createClient();

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${cardId}/${timestamp}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

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

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

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

    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    return null;
  }

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

export async function getAttachments(cardId: string): Promise<Attachment[]> {

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

export async function deleteAttachment(attachmentId: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const supabase = await createClient();

  const { data: attachment } = await supabase
    .from("attachments")
    .select("*, cards(list_id, lists(board_id))")
    .eq("id", attachmentId)
    .single();

  if (!attachment) {
    console.error("Attachment not found");
    return false;
  }

  const access = await verifyCardAccess(attachment.card_id);
  if (!access.allowed) {
    console.error("User does not have access to delete this attachment");
    return false;
  }

  const urlParts = attachment.url.split(`/${BUCKET_NAME}/`);
  if (urlParts.length > 1) {
    const filePath = urlParts[1];

    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
  }

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

  if (file.size > MAX_FILE_SIZE) {
    console.error("File too large");
    return null;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    console.error("File type not allowed:", file.type);
    return null;
  }

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

  const access = await verifyCardAccess(cardId);
  if (!access.allowed) {
    console.error("User does not have access to this card");
    return null;
  }

  const supabase = await createClient();

  const timestamp = Date.now();
  const safeName = fileData.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${cardId}/${timestamp}-${safeName}`;

  const buffer = Buffer.from(fileData.data, "base64");

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

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

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
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    return null;
  }

  return attachment;
}
