-- Create table for catalog inquiries (general contact to owner)
CREATE TABLE public.catalog_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid REFERENCES public.share_links(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.catalog_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Catalog owners can view inquiries for their shared catalogs
CREATE POLICY "Owners can view inquiries for their catalogs"
ON public.catalog_inquiries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.share_links sl
    WHERE sl.id = catalog_inquiries.share_link_id
    AND sl.user_id = auth.uid()
  )
);

-- Policy: Anyone can insert inquiries
CREATE POLICY "Anyone can insert inquiries"
ON public.catalog_inquiries
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_catalog_inquiries_share_link_id ON public.catalog_inquiries(share_link_id);