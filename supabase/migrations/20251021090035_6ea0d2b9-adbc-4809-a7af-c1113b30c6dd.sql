-- Add more granular permissions to vendor_permissions table
ALTER TABLE public.vendor_permissions
ADD COLUMN can_view_catalog boolean DEFAULT true,
ADD COLUMN can_add_vendor_details boolean DEFAULT true,
ADD COLUMN can_view_custom_orders boolean DEFAULT true,
ADD COLUMN can_manage_custom_orders boolean DEFAULT false,
ADD COLUMN can_view_share_links boolean DEFAULT true,
ADD COLUMN can_manage_share_links boolean DEFAULT true;