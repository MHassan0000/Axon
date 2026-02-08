-- =====================================================
-- Workspace Invites Table Migration
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create workspace_invites table
CREATE TABLE IF NOT EXISTS workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  -- Ensure unique pending invites per workspace/user combo
  CONSTRAINT unique_pending_invite UNIQUE (workspace_id, invitee_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_workspace_invites_invitee 
ON workspace_invites(invitee_id, status);

CREATE INDEX IF NOT EXISTS idx_workspace_invites_workspace 
ON workspace_invites(workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_workspace_invites_inviter 
ON workspace_invites(inviter_id);

-- Enable Row Level Security
ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Invitees can view their own invites
CREATE POLICY "Users can view invites sent to them" ON workspace_invites
  FOR SELECT USING (invitee_id = auth.uid());

-- Policy: Inviters can view invites they sent
CREATE POLICY "Users can view invites they sent" ON workspace_invites
  FOR SELECT USING (inviter_id = auth.uid());

-- Policy: Workspace members (owners/admins) can view workspace invites
CREATE POLICY "Workspace admins can view workspace invites" ON workspace_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = workspace_invites.workspace_id 
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- Policy: Service can insert invites (via server actions)
CREATE POLICY "Service can insert invites" ON workspace_invites
  FOR INSERT WITH CHECK (true);

-- Policy: Invitees can update their invites (accept/decline)
CREATE POLICY "Invitees can update their invites" ON workspace_invites
  FOR UPDATE USING (invitee_id = auth.uid());

-- Policy: Workspace owners/admins can delete invites
CREATE POLICY "Workspace admins can delete invites" ON workspace_invites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = workspace_invites.workspace_id 
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- Add metadata column to notifications table for invite data
-- =====================================================

-- Add metadata column if it doesn't exist (JSONB for flexibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE notifications ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- =====================================================
-- Enable Realtime for workspace_invites table
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_invites;
