-- Create purchase inquiries table
CREATE TABLE public.purchase_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_link_id UUID NOT NULL REFERENCES public.share_links(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  quantity INTEGER DEFAULT 1,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchase_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert purchase inquiries (public shareable catalogs)
CREATE POLICY "Anyone can submit purchase inquiries"
ON public.purchase_inquiries
FOR INSERT
WITH CHECK (true);

-- Vendors can view their own purchase inquiries
CREATE POLICY "Vendors can view their purchase inquiries"
ON public.purchase_inquiries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.share_links
    WHERE share_links.id = purchase_inquiries.share_link_id
    AND share_links.user_id = auth.uid()
  )
);

-- Vendors can update status of their purchase inquiries
CREATE POLICY "Vendors can update their purchase inquiries"
ON public.purchase_inquiries
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.share_links
    WHERE share_links.id = purchase_inquiries.share_link_id
    AND share_links.user_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX idx_purchase_inquiries_share_link ON public.purchase_inquiries(share_link_id);
CREATE INDEX idx_purchase_inquiries_product ON public.purchase_inquiries(product_id);
CREATE INDEX idx_purchase_inquiries_status ON public.purchase_inquiries(status);