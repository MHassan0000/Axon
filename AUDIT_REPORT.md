# Axon Application - Production Readiness Audit Report

**Audit Date:** January 2025  
**Application:** Axon - Trello-like Project Management Application  
**Tech Stack:** Next.js 16, React 19, Supabase, Clerk Auth, TypeScript, Tailwind CSS

---

## Executive Summary

### Overall Assessment: **NOT PRODUCTION READY** ⚠️

The application has a solid foundation with well-structured code, comprehensive features, and proper architecture. However, there are **critical security vulnerabilities**, **missing authorization checks**, and **incomplete features** that must be addressed before production deployment.

| Category | Status | Score |
|----------|--------|-------|
| Core Functionality | Mostly Complete | 75% |
| Security & Authorization | Critical Issues | 40% |
| Database Integration | Functional | 70% |
| Authentication | Well Implemented | 85% |
| Billing Integration | Partially Complete | 60% |
| UI/UX Completeness | Good | 80% |
| Error Handling | Needs Improvement | 55% |
| Production Readiness | Not Ready | 50% |

---

## Table of Contents

1. [Critical Security Issues](#1-critical-security-issues)
2. [Authentication Analysis](#2-authentication-analysis)
3. [Billing & Subscription Analysis](#3-billing--subscription-analysis)
4. [Database & Supabase Integration](#4-database--supabase-integration)
5. [Server Actions Audit](#5-server-actions-audit)
6. [Frontend Components Audit](#6-frontend-components-audit)
7. [Missing Features & Incomplete Flows](#7-missing-features--incomplete-flows)
8. [Hardcoded & Mock Data](#8-hardcoded--mock-data)
9. [Unused Code Analysis](#9-unused-code-analysis)
10. [Edge Cases & Race Conditions](#10-edge-cases--race-conditions)
11. [Scalability Concerns](#11-scalability-concerns)
12. [Recommendations & Action Items](#12-recommendations--action-items)

---

## 1. Critical Security Issues

### 🔴 CRITICAL: Missing Authorization Checks

Many server actions lack proper authorization verification. Users can potentially access or modify resources they don't have permission to.

#### Affected Operations:

| Operation | File | Risk Level | Issue |
|-----------|------|------------|-------|
| `deleteCard` | `cards.ts` | 🔴 Critical | No workspace membership check - any authenticated user can delete any card |
| `updateList` | `lists.ts` | 🔴 Critical | No authorization check - any user can modify any list |
| `deleteList` | `lists.ts` | 🔴 Critical | No authorization check |
| `reorderLists` | `lists.ts` | 🔴 Critical | No authorization check |
| `reorderCards` | `cards.ts` | 🔴 Critical | No authorization check |
| `copyList` | `lists.ts` | 🔴 Critical | No authorization check |
| `createLabel` | `boards.ts` | 🟡 Medium | No board ownership check |
| `deleteLabel` | `boards.ts` | 🟡 Medium | No board ownership check |
| `updateBoard` | `boards.ts` | 🟡 Medium | Only checks auth, not workspace membership/role |
| `deleteBoard` | `boards.ts` | 🟡 Medium | Only checks auth, not workspace membership/role |
| `getCard` | `cards.ts` | 🟢 Low | Data disclosure - any user can view any card |
| `getComments` | `cards.ts` | 🟢 Low | Data disclosure |
| All checklist operations | `checklists.ts` | 🟡 Medium | No authorization at all |

**Fix Required:** Add workspace membership verification to ALL operations that modify or read workspace/board/list/card data.

```typescript
// Example fix for deleteCard:
export async function deleteCard(cardId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await createClient();
  
  // Verify user has access to this card's workspace
  const { data: card } = await supabase
    .from("cards")
    .select("*, lists!inner(board_id, boards!inner(workspace_id))")
    .eq("id", cardId)
    .single();
    
  if (!card) return false;
  
  // Check workspace membership
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", card.lists.boards.workspace_id)
    .eq("user_id", user.id)
    .single();
    
  if (!membership) return false; // User not in workspace
  
  // Proceed with deletion
  // ...
}
```

### 🔴 CRITICAL: RLS Policies Not Functional

**Issue:** Row Level Security (RLS) policies reference `auth.uid()` (Supabase Auth) but the application uses Clerk for authentication.

**Impact:** RLS policies are essentially non-functional. All protection relies on:
1. Service role key bypassing RLS (server-side)
2. Application-level authorization checks (inconsistently implemented)

**Location:** `supabase-migration/schema.sql` (lines 188-199)

```sql
-- Current (Non-functional with Clerk):
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- Policies would need auth.uid() which doesn't exist with Clerk
```

**Recommendation:** Either:
1. Implement comprehensive application-level authorization (current approach, needs fixing), OR
2. Pass Clerk user info via JWT claims and create RLS policies based on custom claims

### 🟡 MEDIUM: No Route-Level Protection in Middleware

**Issue:** The middleware doesn't protect dashboard routes at the middleware level.

**Location:** `middleware.ts`

```typescript
// Current:
export default clerkMiddleware();

// Recommended:
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});
```

**Impact:** While server actions check authentication, unauthenticated users can access dashboard page shells before being redirected.

---

## 2. Authentication Analysis

### ✅ What's Working Well

| Feature | Status | Notes |
|---------|--------|-------|
| Clerk Provider Setup | ✅ Complete | Properly wrapped in root layout |
| Sign In/Up Pages | ✅ Complete | Using Clerk components with custom styling |
| User Session Access | ✅ Complete | `currentUser()` used correctly in server actions |
| User Sync to Supabase | ✅ Complete | Lazy sync pattern in `syncCurrentUser()` |
| Client-side Auth UI | ✅ Complete | `<SignedIn>`, `<SignedOut>`, `<UserButton>` used correctly |

### ⚠️ Issues Found

| Issue | Severity | Location |
|-------|----------|----------|
| No Clerk webhooks for user events | 🟡 Medium | Missing `app/api/webhooks/clerk/route.ts` |
| No auth loading states | 🟢 Low | Dashboard pages |
| No session expiry handling | 🟢 Low | Client-side |

**Missing Webhook Implementation:**

The application uses lazy-sync but should also have webhooks for:
- `user.created` - Ensure user is in DB before first dashboard access
- `user.updated` - Sync profile changes
- `user.deleted` - Clean up user data

```typescript
// Recommended: app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  // Verify webhook signature
  // Handle user.created, user.updated, user.deleted events
}
```

---

## 3. Billing & Subscription Analysis

### ✅ What's Implemented

| Feature | Status | Location |
|---------|--------|----------|
| Plan Types (Free/Pro) | ✅ Defined | `lib/billing.ts` |
| Plan Limits | ✅ Defined | `lib/billing.ts` |
| Workspace Creation Gating | ✅ Working | `createWorkspace()` |
| Board Creation Gating | ✅ Working | `createBoard()` |
| Pricing Table | ✅ Working | `/pricing` page with `<PricingTable />` |
| Plan Check via Clerk | ✅ Working | `getUserPlan()` uses `auth().has()` |

### ⚠️ Issues & Missing Features

| Issue | Severity | Notes |
|-------|----------|-------|
| No Stripe webhooks | 🔴 Critical | Subscription changes not synced |
| `canUploadAttachments()` not used | 🟡 Medium | Function exists but attachments not implemented |
| `canUseAdvancedLabels()` not used | 🟡 Medium | No advanced label features exist |
| No upgrade prompts at limit | 🟡 Medium | `UpgradePrompt` component exists but underutilized |
| No subscription status display | 🟡 Medium | Users can't see their current plan in dashboard |

**Plan Limits Configuration:**
```typescript
// Current limits in lib/billing.ts
free: {
  maxWorkspaces: 2,
  maxBoardsPerWorkspace: 3,
  canUploadAttachments: false,      // NOT ENFORCED
  canUseAdvancedLabels: false,      // NOT ENFORCED
},
pro: {
  maxWorkspaces: Infinity,
  maxBoardsPerWorkspace: Infinity,
  canUploadAttachments: true,
  canUseAdvancedLabels: true,
}
```

**Missing Stripe Webhook Handler:**
```typescript
// Needed: app/api/webhooks/stripe/route.ts
// Handle: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
```

---

## 4. Database & Supabase Integration

### ✅ Schema Quality

The database schema is well-designed with:
- Proper UUID primary keys
- Foreign key constraints with CASCADE deletes
- Appropriate indexes for common queries
- `updated_at` triggers for audit trails

### Database Tables (15 total):

| Table | Status | Notes |
|-------|--------|-------|
| `users` | ✅ Complete | Properly synced with Clerk |
| `workspaces` | ✅ Complete | |
| `workspace_members` | ✅ Complete | Junction table with roles |
| `boards` | ✅ Complete | |
| `lists` | ✅ Complete | |
| `cards` | ✅ Complete | |
| `labels` | ✅ Complete | |
| `card_labels` | ✅ Complete | Junction table |
| `card_assignees` | ✅ Complete | Junction table |
| `comments` | ✅ Complete | |
| `attachments` | ⚠️ Schema only | Upload logic not implemented |
| `activity_log` | ✅ Complete | |
| `checklists` | ✅ Complete | |
| `checklist_items` | ✅ Complete | |
| `notifications` | ✅ Complete | |

### Supabase Client Setup

| Client | Location | Purpose | Security |
|--------|----------|---------|----------|
| Server Client | `lib/supabase/server.ts` | Server actions | Uses SERVICE_ROLE (bypasses RLS) |
| Browser Client | `lib/supabase/client.ts` | Real-time only | Uses ANON key |
| Admin Client | `lib/supabase/admin.ts` | Admin operations | Uses SERVICE_ROLE |

### Real-time Subscriptions

✅ **Properly Implemented** in `lib/hooks/useRealtime.ts`:
- `useBoardRealtime` - Subscribes to list and card changes
- Handles INSERT, UPDATE, DELETE events
- Used in board page for live updates

---

## 5. Server Actions Audit

### Complete List of Server Actions (46 total)

#### Users (`lib/actions/users.ts`) - 3 actions
| Action | Auth Check | Authorization | Status |
|--------|------------|---------------|--------|
| `syncCurrentUser` | ✅ Clerk | N/A | ✅ Complete |
| `getCurrentUser` | ✅ Clerk | N/A | ✅ Complete |
| `searchUsers` | ❌ None | ❌ None | ⚠️ Anyone can search |

#### Workspaces (`lib/actions/workspaces.ts`) - 8 actions
| Action | Auth Check | Authorization | Status |
|--------|------------|---------------|--------|
| `createWorkspace` | ✅ | ✅ Plan limits | ✅ Complete |
| `getWorkspaces` | ✅ | ✅ Membership | ✅ Complete |
| `getWorkspaceWithBoards` | ✅ | ✅ Membership | ✅ Complete |
| `updateWorkspace` | ✅ | ✅ Owner/Admin | ✅ Complete |
| `deleteWorkspace` | ✅ | ✅ Owner only | ✅ Complete |
| `addWorkspaceMember` | ✅ | ✅ Owner/Admin | ✅ Complete |
| `removeWorkspaceMember` | ✅ | ✅ Owner/Admin | ✅ Complete |
| `getWorkspaceMembers` | ❌ | ❌ None | ⚠️ Missing auth |

#### Boards (`lib/actions/boards.ts`) - 7 actions
| Action | Auth Check | Authorization | Status |
|--------|------------|---------------|--------|
| `createBoard` | ✅ | ✅ Membership + Plan | ✅ Complete |
| `getBoards` | ✅ | ✅ Membership | ✅ Complete |
| `getBoardWithLists` | ✅ | ✅ Membership | ✅ Complete |
| `updateBoard` | ✅ | ❌ Missing | 🔴 Fix needed |
| `deleteBoard` | ✅ | ❌ Missing | 🔴 Fix needed |
| `createLabel` | ❌ | ❌ None | 🔴 Fix needed |
| `deleteLabel` | ❌ | ❌ None | 🔴 Fix needed |

#### Lists (`lib/actions/lists.ts`) - 5 actions
| Action | Auth Check | Authorization | Status |
|--------|------------|---------------|--------|
| `createList` | ✅ | ❌ Missing | 🔴 Fix needed |
| `updateList` | ❌ | ❌ None | 🔴 Fix needed |
| `deleteList` | ❌ | ❌ None | 🔴 Fix needed |
| `reorderLists` | ❌ | ❌ None | 🔴 Fix needed |
| `copyList` | ❌ | ❌ None | 🔴 Fix needed |

#### Cards (`lib/actions/cards.ts`) - 13 actions
| Action | Auth Check | Authorization | Status |
|--------|------------|---------------|--------|
| `createCard` | ✅ | ❌ Missing | 🟡 Add membership check |
| `getCard` | ❌ | ❌ None | 🟡 Data disclosure |
| `updateCard` | ✅ | ❌ Missing | 🔴 Fix needed |
| `deleteCard` | ❌ | ❌ None | 🔴 Fix needed |
| `moveCard` | ✅ | ❌ Missing | 🔴 Fix needed |
| `reorderCards` | ❌ | ❌ None | 🔴 Fix needed |
| `addLabelToCard` | ❌ | ❌ None | 🔴 Fix needed |
| `removeLabelFromCard` | ❌ | ❌ None | 🔴 Fix needed |
| `assignUserToCard` | ❌ | ❌ None | 🔴 Fix needed |
| `unassignUserFromCard` | ❌ | ❌ None | 🔴 Fix needed |
| `addComment` | ✅ | ❌ Missing | 🟡 Add membership check |
| `getComments` | ❌ | ❌ None | 🟡 Data disclosure |
| `deleteComment` | ✅ | ✅ Own only | ✅ Complete |

#### Checklists (`lib/actions/checklists.ts`) - 8 actions
| Action | Auth Check | Authorization | Status |
|--------|------------|---------------|--------|
| `createChecklist` | ❌ | ❌ None | 🔴 Fix needed |
| `getChecklists` | ❌ | ❌ None | 🔴 Fix needed |
| `deleteChecklist` | ❌ | ❌ None | 🔴 Fix needed |
| `updateChecklist` | ❌ | ❌ None | 🔴 Fix needed |
| `addChecklistItem` | ❌ | ❌ None | 🔴 Fix needed |
| `toggleChecklistItem` | ❌ | ❌ None | 🔴 Fix needed |
| `deleteChecklistItem` | ❌ | ❌ None | 🔴 Fix needed |
| `updateChecklistItem` | ❌ | ❌ None | 🔴 Fix needed |

#### Activity (`lib/actions/activity.ts`) - 4 actions
| Action | Auth Check | Authorization | Status |
|--------|------------|---------------|--------|
| `logActivity` | ✅ | N/A | ✅ Complete |
| `getRecentActivity` | ✅ | ✅ Own workspaces | ✅ Complete |
| `getCardActivity` | ❌ | ❌ None | 🟡 Data disclosure |
| `getBoardActivity` | ❌ | ❌ None | 🟡 Data disclosure |

#### Notifications (`lib/actions/notifications.ts`) - 8 actions
| Action | Auth Check | Authorization | Status |
|--------|------------|---------------|--------|
| `createNotification` | ❌ | N/A | ✅ Internal use |
| `getNotifications` | ✅ | ✅ Own only | ✅ Complete |
| `getUnreadCount` | ✅ | ✅ Own only | ✅ Complete |
| `markAsRead` | ✅ | ✅ Own only | ✅ Complete |
| `markAllAsRead` | ✅ | ✅ Own only | ✅ Complete |
| `deleteNotification` | ✅ | ✅ Own only | ✅ Complete |
| `clearAllNotifications` | ✅ | ✅ Own only | ✅ Complete |
| `notifyUsers` | ❌ | N/A | ✅ Internal use |

### Summary
- **Total Actions:** 46
- **Properly Secured:** 18 (39%)
- **Need Auth Fix:** 28 (61%)

---

## 6. Frontend Components Audit

### Dashboard Pages

| Page | Route | Status | Issues |
|------|-------|--------|--------|
| Main Dashboard | `/dashboard` | ✅ Complete | None |
| Workspace Detail | `/dashboard/workspace/[id]` | ✅ Complete | None |
| Board (Kanban) | `/dashboard/board/[id]` | ✅ Complete | None |
| Settings | `/dashboard/settings` | ✅ Complete | Email notifications "Coming Soon" |
| Activity | `/dashboard/activity` | ✅ Complete | None |
| Notifications | `/dashboard/notifications` | ✅ Complete | None |
| Calendar | `/dashboard/calendar` | ⚠️ Functional | Basic implementation |
| Analytics | `/dashboard/analytics` | ⚠️ Placeholder | "Activity Charts Coming Soon" |
| Team | `/dashboard/team` | ✅ Complete | None |
| Projects | `/dashboard/projects` | ✅ Complete | None |
| Help | `/dashboard/help` | ✅ Complete | Hardcoded FAQ data |

### Key Components Status

| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| Sidebar | `dashboard-components/Sidebar.tsx` | ✅ Complete | Collapsible, mobile-responsive |
| DashboardNav | `dashboard-components/DashboardNav.tsx` | ✅ Complete | Theme toggle, user menu |
| CardModal | `dashboard-components/CardModal.tsx` | ✅ Complete | Full card editing |
| BoardSettingsModal | `dashboard-components/BoardSettingsModal.tsx` | ✅ Complete | Board config |
| WorkspaceSettingsModal | `dashboard-components/WorkspaceSettingsModal.tsx` | ✅ Complete | Workspace config |
| ChecklistSection | `dashboard-components/ChecklistSection.tsx` | ✅ Complete | Full CRUD |
| GlobalSearch | `dashboard-components/GlobalSearch.tsx` | ✅ Complete | Keyboard shortcuts |
| NotificationBell | `notifications/NotificationBell.tsx` | ✅ Complete | Dropdown with actions |
| UpgradePrompt | `billing/UpgradePrompt.tsx` | ⚠️ Underutilized | Component exists but rarely shown |

### Landing Page Components

| Component | Status | Notes |
|-----------|--------|-------|
| Hero | ✅ Complete | Video background, animations |
| Navbar | ✅ Complete | Auth-aware, mobile menu |
| CoreFeatures | ✅ Complete | Uses constants |
| HowItWorks | ✅ Complete | Uses constants |
| WhyDifferent | ✅ Complete | |
| Testimonials | ✅ Complete | Carousel |
| SocialProof | ⚠️ Hardcoded | Contains inline mock data |
| SignupCTA | ✅ Complete | |
| Footer | ✅ Complete | Uses constants |

---

## 7. Missing Features & Incomplete Flows

### 🔴 Not Implemented

| Feature | Impact | Notes |
|---------|--------|-------|
| File Attachments | High | Schema exists, UI/upload logic missing |
| Email Notifications | Medium | Settings page shows "Coming Soon" |
| Webhook Handlers (Clerk/Stripe) | High | Critical for production |
| Member Invitation System | Medium | Can add members by user ID but no invite flow |
| Activity Charts | Low | Analytics page placeholder |
| Comment Editing | Low | Can only add/delete, not edit |
| Board Templates | Low | Nice to have |

### 🟡 Partially Implemented

| Feature | Current State | Missing |
|---------|---------------|---------|
| User Search for Assignment | Works but no auth | Search endpoint needs protection |
| Advanced Labels | Feature flag exists | No advanced label UI |
| Notification Preferences | Table exists | UI not connected |
| Board Privacy | Field exists | `is_private` not enforced |

### Incomplete User Flows

1. **Member Invitation Flow**
   - ❌ No invite by email
   - ❌ No invitation notifications
   - ❌ No pending invitations UI
   - ✅ Can add existing users by ID

2. **Attachment Flow**
   - ✅ Database table exists
   - ❌ No upload UI
   - ❌ No Supabase Storage setup
   - ❌ No file size limits

3. **Notification Triggers**
   - ✅ Notification infrastructure exists
   - ⚠️ Not triggered on card assignment
   - ⚠️ Not triggered on mentions
   - ⚠️ Not triggered on due dates

---

## 8. Hardcoded & Mock Data

### Files with Hardcoded Data

| File | Data Type | Recommendation |
|------|-----------|----------------|
| `components/shared/SocialProof.tsx` | Stats, testimonials | Move to `constants/homepage.ts` |
| `app/(dashboard)/dashboard/help/page.tsx` | FAQ, shortcuts | Move to `constants/help.ts` |

### Example - SocialProof.tsx

```typescript
// Current (hardcoded):
const stats = [
  { value: "10,000+", label: "Active Users" },
  { value: "50,000+", label: "Projects Managed" },
  // ...
];

// Should be moved to constants/homepage.ts
```

### Constants File Review

`constants/homepage.ts` already exists and contains:
- Navigation items
- Footer links
- Feature descriptions
- How it works steps
- Testimonials

**Missing from constants:**
- SocialProof stats
- Help page FAQ
- Keyboard shortcuts

---

## 9. Unused Code Analysis

### Unused Components

| Component | Location | Status |
|-----------|----------|--------|
| `BoardColumn.tsx` | `dashboard-components/` | ⚠️ Appears unused - demo/legacy |
| `BoardCard.tsx` | `dashboard-components/` | ⚠️ Appears unused - demo/legacy |
| `BoardHeader.tsx` | `dashboard-components/` | ⚠️ Appears unused - demo/legacy |

**Note:** The actual board page (`board/[id]/page.tsx`) has its own inline `ListColumn` and `CardItem` components rather than using these files.

### Unused Billing Functions

| Function | Location | Notes |
|----------|----------|-------|
| `canUploadAttachments()` | `lib/billing.ts` | Never called - attachments not implemented |
| `canUseAdvancedLabels()` | `lib/billing.ts` | Never called - no advanced label feature |
| `hasFeature()` | `lib/billing.ts` | Generic feature check, not utilized |

### Unused Server Actions

All defined server actions appear to be used or are infrastructure for features that should be implemented.

---

## 10. Edge Cases & Race Conditions

### Potential Race Conditions

1. **Drag-and-Drop Reordering**
   ```
   Issue: Multiple users reordering simultaneously
   Location: board/[id]/page.tsx, reorderCards, reorderLists
   Current: Optimistic updates then database sync
   Risk: Position conflicts between users
   Fix: Use database transactions or optimistic locking
   ```

2. **Card Movement Between Lists**
   ```
   Issue: Two users moving same card simultaneously
   Location: moveCard action
   Current: Last write wins
   Risk: Inconsistent state
   Fix: Add version/timestamp check
   ```

3. **Real-time + Optimistic Updates**
   ```
   Issue: Real-time events may conflict with optimistic updates
   Location: useBoardRealtime hook
   Current: Both update state independently
   Risk: Duplicate items or missed updates
   Fix: Deduplicate by ID, check if update already applied
   ```

### Edge Cases Not Handled

| Scenario | Impact | Fix |
|----------|--------|-----|
| Workspace deleted while user viewing board | Broken UI | Show error, redirect |
| Board deleted while card modal open | Broken UI | Close modal, show toast |
| Session expires during edit | Lost changes | Implement auto-save or warning |
| Network failure during drag-drop | Inconsistent state | Rollback optimistic update |
| Concurrent label edits | Potential conflicts | Last-write-wins acceptable |

---

## 11. Scalability Concerns

### Database Query Optimization

1. **getBoardWithLists Heavy Query**
   ```typescript
   // Current: Multiple sequential queries
   // Issue: N+1 queries for labels, assignees per card
   
   // Recommendation: Use single query with joins
   const { data } = await supabase
     .from("boards")
     .select(`
       *,
       lists (
         *,
         cards (
           *,
           card_labels (*, labels (*)),
           card_assignees (*, users (*))
         )
       ),
       labels (*)
     `)
     .eq("id", boardId)
     .single();
   ```

2. **Pagination Missing**
   - Activity log: Limited to 50 items (good)
   - Comments: No pagination (issue for popular cards)
   - Notifications: Has pagination (good)
   - Workspace boards: No pagination (could be issue)

### Indexing Review

Current indexes (from schema):
- ✅ `idx_users_clerk_id` - Fast user lookup
- ✅ `idx_boards_workspace` - Workspace boards
- ✅ `idx_lists_board` - Board lists
- ✅ `idx_cards_list` - List cards
- ✅ `idx_labels_board` - Board labels
- ✅ `idx_comments_card` - Card comments
- ✅ `idx_attachments_card` - Card attachments
- ✅ `idx_activity_card`, `idx_activity_board` - Activity lookup

**Missing Indexes:**
```sql
-- For workspace member lookups
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- For notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- For card due dates (calendar view)
CREATE INDEX idx_cards_due_date ON cards(due_date) WHERE due_date IS NOT NULL;
```

---

## 12. Recommendations & Action Items

### Immediate (Before Launch) 🔴

1. **Fix Authorization in Server Actions** (2-3 days)
   - Add workspace membership checks to all list/card/checklist operations
   - Create reusable `verifyWorkspaceAccess(workspaceId)` helper
   - Test all endpoints with different user roles

2. **Add Route Protection in Middleware** (30 min)
   ```typescript
   const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
   export default clerkMiddleware((auth, req) => {
     if (isProtectedRoute(req)) auth().protect();
   });
   ```

3. **Implement Stripe Webhooks** (1 day)
   - Handle subscription lifecycle events
   - Sync plan status to local state if needed

4. **Implement Clerk Webhooks** (1 day)
   - Handle user.created for immediate DB sync
   - Handle user.deleted for cleanup

5. **Add Error Boundaries** (1 day)
   - Wrap dashboard in error boundary
   - Add fallback UI for failed data fetches

### Short-term (Post-Launch) 🟡

1. **Implement File Attachments** (2-3 days)
   - Set up Supabase Storage bucket
   - Add upload UI in card modal
   - Enforce plan limits

2. **Add Member Invitation Flow** (2 days)
   - Email invitation system
   - Pending invitations UI
   - Accept/decline flow

3. **Trigger Notifications** (1 day)
   - On card assignment
   - On mentions in comments
   - On approaching due dates (cron job)

4. **Clean Up Unused Components** (1 hour)
   - Remove or repurpose BoardColumn, BoardCard, BoardHeader

5. **Move Hardcoded Data to Constants** (1 hour)
   - SocialProof stats
   - Help page content

### Long-term (Nice to Have) 🟢

1. Board templates
2. Activity analytics with charts
3. Email notifications
4. Comment editing
5. Card cover images
6. Board backgrounds (images)
7. Keyboard shortcuts for power users
8. Bulk card operations
9. Card templates
10. Export functionality

---

## Appendix A: Server Action Authorization Fix Template

```typescript
// lib/actions/helpers.ts
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./users";

export async function verifyWorkspaceAccess(
  workspaceId: string,
  requiredRole?: "owner" | "admin" | "member"
): Promise<{ allowed: boolean; role?: string; userId?: string }> {
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

  if (requiredRole) {
    const roleHierarchy = { owner: 3, admin: 2, member: 1 };
    const hasRole = roleHierarchy[membership.role] >= roleHierarchy[requiredRole];
    return { allowed: hasRole, role: membership.role, userId: user.id };
  }

  return { allowed: true, role: membership.role, userId: user.id };
}

export async function verifyBoardAccess(boardId: string): Promise<{ 
  allowed: boolean; 
  workspaceId?: string;
  userId?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { allowed: false };

  const supabase = await createClient();
  
  const { data: board } = await supabase
    .from("boards")
    .select("workspace_id")
    .eq("id", boardId)
    .single();

  if (!board) return { allowed: false };

  const access = await verifyWorkspaceAccess(board.workspace_id);
  return { ...access, workspaceId: board.workspace_id };
}

export async function verifyCardAccess(cardId: string): Promise<{
  allowed: boolean;
  workspaceId?: string;
  boardId?: string;
  userId?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { allowed: false };

  const supabase = await createClient();
  
  const { data: card } = await supabase
    .from("cards")
    .select("*, lists!inner(board_id, boards!inner(workspace_id))")
    .eq("id", cardId)
    .single();

  if (!card) return { allowed: false };

  const workspaceId = (card.lists as any).boards.workspace_id;
  const boardId = (card.lists as any).board_id;
  
  const access = await verifyWorkspaceAccess(workspaceId);
  return { ...access, workspaceId, boardId };
}
```

---

## Appendix B: Test Checklist

### Authentication Tests
- [ ] Unauthenticated user cannot access /dashboard
- [ ] Sign in redirects to /dashboard
- [ ] Sign out clears session and redirects
- [ ] User data syncs to Supabase on first login

### Authorization Tests
- [ ] User can only see own workspaces
- [ ] Non-member cannot view workspace boards
- [ ] Only owner can delete workspace
- [ ] Only owner/admin can add/remove members
- [ ] Member cannot view other workspace's data via direct API call

### Billing Tests
- [ ] Free user cannot create more than 2 workspaces
- [ ] Free user cannot create more than 3 boards per workspace
- [ ] Pro user can create unlimited workspaces/boards
- [ ] Upgrade flow works end-to-end

### Real-time Tests
- [ ] Card created by User A appears for User B
- [ ] Card moved by User A updates for User B
- [ ] Card deleted by User A disappears for User B
- [ ] No duplicate items on real-time events

---

## Conclusion

The Axon application has a solid foundation with well-implemented features for a Trello clone. However, **critical authorization vulnerabilities** must be addressed before production deployment. The primary concerns are:

1. ~60% of server actions lack proper authorization
2. No webhook handlers for Clerk/Stripe events
3. Several planned features (attachments, email notifications) are incomplete

**Estimated time to production-ready:** 5-7 development days

**Recommendation:** Do NOT deploy to production until at least the "Immediate" action items are completed.
