import { z } from "zod";

// =====================================================
// Workspace Validation Schemas
// =====================================================

export const workspaceNameSchema = z
  .string()
  .min(1, "Workspace name is required")
  .max(100, "Workspace name must be 100 characters or less")
  .trim();

export const workspaceDescriptionSchema = z
  .string()
  .max(500, "Description must be 500 characters or less")
  .optional();

export const createWorkspaceSchema = z.object({
  name: workspaceNameSchema,
  description: workspaceDescriptionSchema,
});

export const updateWorkspaceSchema = z.object({
  name: workspaceNameSchema.optional(),
  description: workspaceDescriptionSchema,
});

// =====================================================
// Board Validation Schemas
// =====================================================

export const boardNameSchema = z
  .string()
  .min(1, "Board name is required")
  .max(100, "Board name must be 100 characters or less")
  .trim();

export const boardColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
  .optional();

export const boardImageSchema = z
  .string()
  .url("Invalid image URL")
  .optional()
  .nullable();

export const createBoardSchema = z.object({
  name: boardNameSchema,
  workspace_id: z.string().uuid("Invalid workspace ID"),
  background_color: boardColorSchema,
  background_image: boardImageSchema,
  description: z.string().max(500).optional(),
});

export const updateBoardSchema = z.object({
  name: boardNameSchema.optional(),
  description: z.string().max(500).optional(),
  background_color: boardColorSchema,
  background_image: boardImageSchema,
});

// =====================================================
// List Validation Schemas
// =====================================================

export const listNameSchema = z
  .string()
  .min(1, "List name is required")
  .max(100, "List name must be 100 characters or less")
  .trim();

export const createListSchema = z.object({
  name: listNameSchema,
  board_id: z.string().uuid("Invalid board ID"),
  color: z.string().optional(),
});

export const updateListSchema = z.object({
  name: listNameSchema.optional(),
  color: z.string().optional(),
});

// =====================================================
// Card Validation Schemas
// =====================================================

export const cardTitleSchema = z
  .string()
  .min(1, "Card title is required")
  .max(500, "Card title must be 500 characters or less")
  .trim();

export const cardDescriptionSchema = z
  .string()
  .max(10000, "Description must be 10,000 characters or less")
  .optional();

export const createCardSchema = z.object({
  title: cardTitleSchema,
  list_id: z.string().uuid("Invalid list ID"),
  description: cardDescriptionSchema,
});

export const updateCardSchema = z.object({
  title: cardTitleSchema.optional(),
  description: cardDescriptionSchema,
  due_date: z.string().nullable().optional().transform((val) => {
    // Accept both date-only (YYYY-MM-DD) and datetime (ISO) formats
    if (!val) return val;
    // If it's just a date, convert to ISO datetime at start of day
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(val + 'T00:00:00.000Z').toISOString();
    }
    return val;
  }),
});

// =====================================================
// Comment Validation Schema
// =====================================================

export const commentContentSchema = z
  .string()
  .min(1, "Comment cannot be empty")
  .max(5000, "Comment must be 5,000 characters or less")
  .trim();

export const createCommentSchema = z.object({
  card_id: z.string().uuid("Invalid card ID"),
  content: commentContentSchema,
});

// =====================================================
// Label Validation Schema
// =====================================================

export const labelNameSchema = z
  .string()
  .max(50, "Label name must be 50 characters or less")
  .optional();

export const labelColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format");

export const createLabelSchema = z.object({
  board_id: z.string().uuid("Invalid board ID"),
  name: labelNameSchema,
  color: labelColorSchema,
});

// =====================================================
// Checklist Validation Schemas
// =====================================================

export const checklistTitleSchema = z
  .string()
  .min(1, "Checklist title is required")
  .max(100, "Checklist title must be 100 characters or less")
  .trim();

export const checklistItemTitleSchema = z
  .string()
  .min(1, "Item title is required")
  .max(500, "Item title must be 500 characters or less")
  .trim();

// =====================================================
// Utility Types
// =====================================================

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;

// =====================================================
// Validation Helper
// =====================================================

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessage = result.error.issues[0]?.message || "Invalid input";
  return { success: false, error: errorMessage };
}
