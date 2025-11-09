-- Create storage bucket for vendor QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-qr-codes', 'vendor-qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects for vendor-qr-codes bucket
CREATE POLICY "Vendor QR codes are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vendor-qr-codes');

CREATE POLICY "Users can upload their own QR codes"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-qr-codes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own QR codes"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vendor-qr-codes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own QR codes"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vendor-qr-codes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);