// =====================================================
// Server Actions Index
// =====================================================
// Re-export all server actions for convenient imports

// User actions
export { 
  syncCurrentUser, 
  getCurrentUser, 
  getUserById, 
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
} from "./boards";

// List actions
export {
  createList,
  getLists,
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
