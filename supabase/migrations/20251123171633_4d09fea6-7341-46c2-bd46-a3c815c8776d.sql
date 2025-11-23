-- Add override_plan_limits field to vendor_permissions table
ALTER TABLE public.vendor_permissions 
ADD COLUMN override_plan_limits boolean DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN public.vendor_permissions.override_plan_limits IS 'When true, vendor can bypass all plan limits set by their subscription tier';

-- Update existing rows to have the default value
UPDATE public.vendor_permissions 
SET override_plan_limits = false 
WHERE override_plan_limits IS NULL;