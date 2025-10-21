-- Add share_link_id to custom_orders to track which share link generated the order
ALTER TABLE public.custom_orders
ADD COLUMN share_link_id uuid REFERENCES public.share_links(id);

-- Add show_vendor_details to share_links to control header visibility
ALTER TABLE public.share_links
ADD COLUMN show_vendor_details boolean NOT NULL DEFAULT true;