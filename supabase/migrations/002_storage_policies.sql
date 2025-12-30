-- PNSDC-buildFlow Storage Policies
-- Migration: 002_storage_policies.sql
-- Date: 2025-12-29
-- Description: Storage bucket policies for proof images
--
-- IMPORTANT: First create the bucket in Supabase Dashboard:
-- 1. Go to Storage in sidebar
-- 2. Click "New bucket"
-- 3. Name: proof-images
-- 4. Check "Public bucket"
-- 5. Click "Create bucket"
-- Then run this SQL:

-- Allow public to view all images in proof-images bucket
CREATE POLICY "Public can view proof images"
ON storage.objects FOR SELECT
USING (bucket_id = 'proof-images');

-- Allow anyone to upload images (for donation form)
CREATE POLICY "Anyone can upload proof images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'proof-images');

-- Allow service role to delete (for cleanup if needed)
CREATE POLICY "Service role can delete proof images"
ON storage.objects FOR DELETE
USING (bucket_id = 'proof-images' AND auth.role() = 'service_role');
