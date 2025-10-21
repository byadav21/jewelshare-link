-- Enable realtime for vendor_permissions table
ALTER TABLE public.vendor_permissions REPLICA IDENTITY FULL;

-- Add vendor_permissions to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_permissions;