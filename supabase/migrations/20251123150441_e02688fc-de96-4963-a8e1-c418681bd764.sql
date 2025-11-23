-- Create video_requests table
CREATE TABLE public.video_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id),
  share_link_id UUID REFERENCES public.share_links(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  requested_products TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit video requests
CREATE POLICY "Anyone can submit video requests"
ON public.video_requests
FOR INSERT
WITH CHECK (true);

-- Share link owners can view their video requests
CREATE POLICY "Share link owners can view video requests"
ON public.video_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.share_links
    WHERE share_links.id = video_requests.share_link_id
    AND share_links.user_id = auth.uid()
  )
);

-- Admins can update video requests
CREATE POLICY "Admins can update video requests"
ON public.video_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_video_requests_updated_at
BEFORE UPDATE ON public.video_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();