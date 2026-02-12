
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Board {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  background_color: string;
  background_image: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  position: number;
  due_date: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  board_id: string;
  name: string | null;
  color: string;
  created_at: string;
}

export interface CardLabel {
  card_id: string;
  label_id: string;
}

export interface CardAssignee {
  card_id: string;
  user_id: string;
  assigned_at: string;
}

export interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  card_id: string;
  name: string;
  url: string;
  type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  card_id: string | null;
  board_id: string | null;
  user_id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Checklist {
  id: string;
  card_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  is_complete: boolean;
  position: number;
  created_at: string;
}

export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'card_assigned' | 'comment_added' | 'due_soon' | 'due_overdue' | 'workspace_invite' | 'mentioned' | 'card_moved';
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
  metadata?: {
    invite_id?: string;
    workspace_id?: string;
    workspace_name?: string;
  } | null;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at: string | null;
}

export interface WorkspaceInviteWithDetails extends WorkspaceInvite {
  workspace?: {
    id: string;
    name: string;
  };
  inviter?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
  invitee?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  card_assigned: boolean;
  comments: boolean;
  due_reminders: boolean;
  workspace_invites: boolean;
}

export interface CardWithRelations extends Card {
  labels?: Label[];
  assignees?: User[];
  comments_count?: number;
  attachments_count?: number;
  checklists?: ChecklistWithItems[];
}

export interface ListWithCards extends List {
  cards: CardWithRelations[];
}

export interface BoardWithLists extends Board {
  lists: ListWithCards[];
  labels?: Label[];
}

export interface WorkspaceWithBoards extends Workspace {
  boards: Board[];
  members?: WorkspaceMember[];
}

export interface CreateBoardInput {
  workspace_id: string;
  name: string;
  description?: string;
  is_private?: boolean;
  background_color?: string;
  background_image?: string;
}

export interface UpdateBoardInput {
  name?: string;
  description?: string;
  is_private?: boolean;
  background_color?: string;
  background_image?: string | null;
  position?: number;
}

export interface CreateListInput {
  board_id: string;
  name: string;
  color?: string;
}

export interface UpdateListInput {
  name?: string;
  color?: string;
  position?: number;
}

export interface CreateCardInput {
  list_id: string;
  title: string;
  description?: string;
  due_date?: string;
}

export interface UpdateCardInput {
  title?: string;
  description?: string;
  due_date?: string | null;
  is_complete?: boolean;
  position?: number;
  list_id?: string; // For moving cards between lists
}

export interface CreateCommentInput {
  card_id: string;
  content: string;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
}
