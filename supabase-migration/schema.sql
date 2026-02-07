-- =====================================================
-- Axon Trello Clone - Database Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (synced from Clerk)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast Clerk ID lookup
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- =====================================================
-- WORKSPACES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WORKSPACE MEMBERS (junction table)
-- =====================================================
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- =====================================================
-- BOARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  background_color TEXT DEFAULT '#1f1f23',
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for workspace boards lookup
CREATE INDEX IF NOT EXISTS idx_boards_workspace ON boards(workspace_id);

-- =====================================================
-- LISTS TABLE (Kanban columns)
-- =====================================================
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for board lists lookup
CREATE INDEX IF NOT EXISTS idx_lists_board ON lists(board_id);

-- =====================================================
-- CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INT NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for list cards lookup
CREATE INDEX IF NOT EXISTS idx_cards_list ON cards(list_id);

-- =====================================================
-- LABELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for board labels lookup
CREATE INDEX IF NOT EXISTS idx_labels_board ON labels(board_id);

-- =====================================================
-- CARD LABELS (junction table)
-- =====================================================
CREATE TABLE IF NOT EXISTS card_labels (
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

-- =====================================================
-- CARD ASSIGNEES (junction table)
-- =====================================================
CREATE TABLE IF NOT EXISTS card_assignees (
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (card_id, user_id)
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for card comments lookup
CREATE INDEX IF NOT EXISTS idx_comments_card ON comments(card_id);

-- =====================================================
-- ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for card attachments lookup
CREATE INDEX IF NOT EXISTS idx_attachments_card ON attachments(card_id);

-- =====================================================
-- ACTIVITY LOG TABLE (for card history)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'moved', 'updated', 'commented', etc.
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for card activity lookup
CREATE INDEX IF NOT EXISTS idx_activity_card ON activity_log(card_id);
CREATE INDEX IF NOT EXISTS idx_activity_board ON activity_log(board_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card_assigned', 'comment_added', 'due_soon', 'due_overdue', 'workspace_invite', 'mentioned', 'card_moved')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  card_assigned BOOLEAN DEFAULT true,
  comments BOOLEAN DEFAULT true,
  due_reminders BOOLEAN DEFAULT true,
  workspace_invites BOOLEAN DEFAULT true
);

-- =====================================================
-- CHECKLISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Checklist',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklists_card ON checklists(card_id);

-- =====================================================
-- CHECKLIST ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON checklist_items(checklist_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will need to be created based on your auth setup
-- Since you're using Clerk (not Supabase Auth), you'll need to pass
-- the user ID from your server actions and use service role key

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET FOR ATTACHMENTS
-- =====================================================
-- Run this in the Supabase SQL Editor to create the storage bucket:
-- 
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'attachments',
--   'attachments', 
--   true,
--   10485760, -- 10MB
--   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
--         'application/pdf', 'application/msword', 
--         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--         'application/vnd.ms-excel', 
--         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
--         'text/plain', 'text/csv', 'application/json', 'application/zip']
-- );
--
-- -- Allow public read access to attachments
-- CREATE POLICY "Public Access" ON storage.objects 
-- FOR SELECT USING (bucket_id = 'attachments');
--
-- -- Allow authenticated uploads (via service role)
-- CREATE POLICY "Service Role Upload" ON storage.objects 
-- FOR INSERT WITH CHECK (bucket_id = 'attachments');
--
-- CREATE POLICY "Service Role Delete" ON storage.objects 
-- FOR DELETE USING (bucket_id = 'attachments');

