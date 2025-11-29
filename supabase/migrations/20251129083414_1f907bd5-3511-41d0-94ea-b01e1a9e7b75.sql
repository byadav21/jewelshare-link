-- Make manufacturing-estimates bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'manufacturing-estimates';

-- Create RLS policy for authenticated users to access their own estimate files
CREATE POLICY "Users can access their own estimate files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'manufacturing-estimates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy for authenticated users to upload their own estimate files
CREATE POLICY "Users can upload their own estimate files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'manufacturing-estimates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy for authenticated users to delete their own estimate files
CREATE POLICY "Users can delete their own estimate files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'manufacturing-estimates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can access all estimate files
CREATE POLICY "Admins can access all estimate files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'manufacturing-estimates' AND
  has_role(auth.uid(), 'admin'::app_role)
);