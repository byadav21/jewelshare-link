-- Create table for tracking product interests from shared catalogs
CREATE TABLE public.product_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  share_link_id uuid REFERENCES public.share_links(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(product_id, share_link_id, customer_email)
);

-- Enable RLS
ALTER TABLE public.product_interests ENABLE ROW LEVEL SECURITY;

-- Policy: Catalog owners can view interests for their products
CREATE POLICY "Owners can view interests for their products"
ON public.product_interests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_interests.product_id
    AND p.user_id = auth.uid()
  )
);

-- Policy: Anyone can insert interests (for shared catalog viewers)
CREATE POLICY "Anyone can insert interests"
ON public.product_interests
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_product_interests_product_id ON public.product_interests(product_id);
CREATE INDEX idx_product_interests_share_link_id ON public.product_interests(share_link_id);