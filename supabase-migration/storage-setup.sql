-- =====================================================
-- Supabase Storage Setup for Attachments
-- =====================================================
-- Run this in your Supabase SQL Editor to create the storage bucket
-- This is separate from the main schema because storage operations
-- require special handling in Supabase
-- =====================================================

-- Create the attachments storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments', 
  true,  -- Public bucket (files are accessible via URL)
  10485760, -- 10MB max file size
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml',
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 
    'text/csv', 
    'application/json', 
    'application/zip',
    'application/x-rar-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow public read access to all files in the attachments bucket
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');

-- Allow authenticated uploads via service role
-- Note: Since we use Clerk (not Supabase Auth), the service role key
-- bypasses RLS. These policies are for documentation purposes.
CREATE POLICY IF NOT EXISTS "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'attachments');

-- Allow deletion of files
CREATE POLICY IF NOT EXISTS "Allow delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'attachments');
