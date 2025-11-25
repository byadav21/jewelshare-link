-- Drop existing policies for brand-logos
DROP POLICY IF EXISTS "Vendors can upload their own brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can update their own brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can delete their own brand logos" ON storage.objects;

-- Create simpler policies for brand-logos that allow authenticated users to upload
CREATE POLICY "Authenticated users can upload brand logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'brand-logos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update brand logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'brand-logos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete brand logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'brand-logos' AND
  auth.role() = 'authenticated'
);