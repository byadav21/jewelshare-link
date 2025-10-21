-- Add max_active_sessions column to vendor_permissions table
ALTER TABLE public.vendor_permissions 
ADD COLUMN max_active_sessions INTEGER NOT NULL DEFAULT 3;

-- Add comment explaining the column
COMMENT ON COLUMN public.vendor_permissions.max_active_sessions IS 'Maximum number of concurrent active sessions allowed for this vendor';
