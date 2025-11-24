-- Create table to track product views from shared catalogs
CREATE TABLE IF NOT EXISTS public.share_link_product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID NOT NULL REFERENCES public.share_links(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  viewer_ip TEXT,
  viewer_user_agent TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_share_link_product_views_share_link 
  ON public.share_link_product_views(share_link_id);
CREATE INDEX IF NOT EXISTS idx_share_link_product_views_product 
  ON public.share_link_product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_share_link_product_views_viewed_at 
  ON public.share_link_product_views(viewed_at DESC);

-- Enable RLS
ALTER TABLE public.share_link_product_views ENABLE ROW LEVEL SECURITY;

-- Allow inserting views from anyone (public tracking)
CREATE POLICY "Anyone can track product views"
  ON public.share_link_product_views
  FOR INSERT
  WITH CHECK (true);

-- Share link owners can view their analytics
CREATE POLICY "Share link owners can view product views"
  ON public.share_link_product_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.share_links
      WHERE share_links.id = share_link_product_views.share_link_id
      AND share_links.user_id = auth.uid()
    )
  );

-- Admins can view all
CREATE POLICY "Admins can view all product views"
  ON public.share_link_product_views
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));