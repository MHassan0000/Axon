-- =====================================================
-- Migration: Add Board Background Image Support
-- =====================================================
-- Run this in your Supabase SQL Editor to:
-- 1. Add background_image column to boards table
-- 2. Create storage bucket for board background images
-- 3. Set up storage policies for the bucket
-- =====================================================

-- =====================================================
-- STEP 1: Add background_image column to boards table
-- =====================================================

ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS background_image TEXT DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN boards.background_image IS 'URL to custom background image stored in Supabase Storage';

-- =====================================================
-- STEP 2: Create the board-backgrounds storage bucket
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'board-backgrounds',
  'board-backgrounds', 
  true,  -- Public bucket (images are accessible via URL)
  5242880, -- 5MB max file size
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- STEP 3: Set up storage policies
-- =====================================================

-- Allow public read access to all files in the board-backgrounds bucket
DROP POLICY IF EXISTS "Public Read Access for Board Backgrounds" ON storage.objects;
CREATE POLICY "Public Read Access for Board Backgrounds"
ON storage.objects FOR SELECT
USING (bucket_id = 'board-backgrounds');

-- Allow authenticated uploads via service role
-- Note: Since we use Clerk (not Supabase Auth), the service role key
-- bypasses RLS. These policies are for documentation purposes.
DROP POLICY IF EXISTS "Allow Board Background Uploads" ON storage.objects;
CREATE POLICY "Allow Board Background Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'board-backgrounds');

-- Allow deletion of board background files
DROP POLICY IF EXISTS "Allow Board Background Delete" ON storage.objects;
CREATE POLICY "Allow Board Background Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'board-backgrounds');

-- Allow updates to board background files (for replacing images)
DROP POLICY IF EXISTS "Allow Board Background Update" ON storage.objects;
CREATE POLICY "Allow Board Background Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'board-backgrounds');

-- =====================================================
-- VERIFICATION QUERIES (Optional - run to verify setup)
-- =====================================================

-- Check if column was added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'boards' AND column_name = 'background_image';

-- Check if bucket was created:
-- SELECT * FROM storage.buckets WHERE id = 'board-backgrounds';

-- Check storage policies:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects';
