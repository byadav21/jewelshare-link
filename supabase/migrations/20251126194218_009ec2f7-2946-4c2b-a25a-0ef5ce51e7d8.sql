-- Add reference_images column to manufacturing_cost_estimates
ALTER TABLE manufacturing_cost_estimates
ADD COLUMN reference_images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create storage bucket for manufacturing estimate images
INSERT INTO storage.buckets (id, name, public)
VALUES ('manufacturing-estimates', 'manufacturing-estimates', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects for manufacturing-estimates bucket
CREATE POLICY "Users can upload their own estimate images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'manufacturing-estimates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own estimate images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'manufacturing-estimates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own estimate images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'manufacturing-estimates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own estimate images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'manufacturing-estimates' AND
  auth.uid()::text = (storage.foldername(name))[1]
);