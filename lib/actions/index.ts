// =====================================================
// Server Actions Index
// =====================================================
// Re-export all server actions for convenient imports

// User actions
export { 
  syncCurrentUser, 
  getCurrentUser, 
  searchUsers 
} from "./users";

// Workspace actions
export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceWithBoards,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  getWorkspaceMembers,
  inviteWorkspaceMemberByEmail,
  sendWorkspaceInvite,
  acceptWorkspaceInvite,
  declineWorkspaceInvite,
  leaveWorkspace,
  getWorkspacePendingInvites,
  cancelWorkspaceInvite,
  getUserWorkspaceRole,
} from "./workspaces";

// Board actions
export {
  createBoard,
  getBoards,
  getBoardWithLists,
  updateBoard,
  deleteBoard,
  createLabel,
  deleteLabel,
  uploadBoardBackground,
} from "./boards";

// List actions
export {
  createList,
  updateList,
  deleteList,
  reorderLists,
  copyList,
} from "./lists";

// Card actions
export {
  createCard,
  getCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
  addLabelToCard,
  removeLabelFromCard,
  assignUserToCard,
  unassignUserFromCard,
  addComment,
  getComments,
  deleteComment,
} from "./cards";

// Checklist actions
export {
  createChecklist,
  getChecklists,
  deleteChecklist,
  updateChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
} from "./checklists";

// Activity actions
export {
  logActivity,
  getRecentActivity,
  getCardActivity,
  getBoardActivity,
  deleteAllActivity,
} from "./activity";

// Authorization helpers
export {
  verifyWorkspaceAccess,
  verifyBoardAccess,
  verifyListAccess,
  verifyCardAccess,
  verifyChecklistAccess,
  verifyChecklistItemAccess,
} from "./helpers";

// Search actions
export {
  globalSearch,
  quickSearch,
  searchInBoard,
  searchInWorkspace,
} from "./search";

export type {
  SearchResult,
  SearchResultType,
  SearchResponse,
} from "./search";

// Attachment actions
export {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  prepareAttachment,
  uploadPreparedAttachment,
} from "./attachments";

// Notification actions
export {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  notifyUsers,
} from "./notifications";

export type { NotificationType } from "./notifications";

// Dashboard optimized actions
export {
  getAllUserBoards,
  getAllTeamMembers,
  getCardsWithDueDates,
  getAnalyticsSummary,
  getDashboardStats,
} from "./dashboard";

export type {
  DashboardStats,
  BoardWithWorkspace,
  TeamMember,
  CalendarCard,
  AnalyticsSummary,
} from "./dashboard";
