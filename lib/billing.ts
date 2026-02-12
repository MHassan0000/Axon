import { auth } from "@clerk/nextjs/server";

export type PlanType = "free" | "pro";

export interface PlanLimits {
  maxWorkspaces: number;
  maxBoardsPerWorkspace: number;
  canUploadAttachments: boolean;
  canUseAdvancedLabels: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxWorkspaces: 2,
    maxBoardsPerWorkspace: 3,
    canUploadAttachments: false,
    canUseAdvancedLabels: false,
  },
  pro: {
    maxWorkspaces: Infinity,
    maxBoardsPerWorkspace: Infinity,
    canUploadAttachments: true,
    canUseAdvancedLabels: true,
  },
};

export async function getUserPlan(): Promise<PlanType> {
  const { has } = await auth();

  const hasPro = has({ plan: "pro" });

  return hasPro ? "pro" : "free";
}

export async function getUserPlanLimits(): Promise<PlanLimits> {
  const plan = await getUserPlan();
  return PLAN_LIMITS[plan];
}

export async function hasFeature(
  feature: "unlimited_workspaces" | "unlimited_boards" | "file_attachments" | "advanced_labels"
): Promise<boolean> {
  const { has } = await auth();
  return has({ feature });
}

export async function canCreateWorkspace(currentCount: number): Promise<{
  allowed: boolean;
  reason?: string;
  limit: number;
}> {
  const limits = await getUserPlanLimits();

  if (currentCount >= limits.maxWorkspaces) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.maxWorkspaces} workspaces on the Free plan. Upgrade to Pro for unlimited workspaces.`,
      limit: limits.maxWorkspaces,
    };
  }

  return { allowed: true, limit: limits.maxWorkspaces };
}

export async function canCreateBoard(currentCount: number): Promise<{
  allowed: boolean;
  reason?: string;
  limit: number;
}> {
  const limits = await getUserPlanLimits();

  if (currentCount >= limits.maxBoardsPerWorkspace) {
    return {
      allowed: false,
      reason: `You've reached the maximum of ${limits.maxBoardsPerWorkspace} boards per workspace on the Free plan. Upgrade to Pro for unlimited boards.`,
      limit: limits.maxBoardsPerWorkspace,
    };
  }

  return { allowed: true, limit: limits.maxBoardsPerWorkspace };
}

export async function canUploadAttachments(): Promise<boolean> {
  const limits = await getUserPlanLimits();
  return limits.canUploadAttachments;
}

export async function canUseAdvancedLabels(): Promise<boolean> {
  const limits = await getUserPlanLimits();
  return limits.canUseAdvancedLabels;
}
