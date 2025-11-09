-- Create vendor permissions table
CREATE TABLE public.vendor_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_add_products boolean DEFAULT true,
  can_import_data boolean DEFAULT true,
  can_share_catalog boolean DEFAULT true,
  can_manage_team boolean DEFAULT false,
  can_view_interests boolean DEFAULT true,
  can_delete_products boolean DEFAULT true,
  can_edit_products boolean DEFAULT true,
  can_edit_profile boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.vendor_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own permissions" ON public.vendor_permissions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions" ON public.vendor_permissions
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert permissions" ON public.vendor_permissions
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update permissions" ON public.vendor_permissions
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to create default permissions for new approved vendors
CREATE OR REPLACE FUNCTION public.create_default_vendor_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default permissions when a user is approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.vendor_permissions (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create permissions on approval
CREATE TRIGGER on_vendor_approved
  AFTER INSERT OR UPDATE ON public.user_approval_status
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_vendor_permissions();

-- Add updated_at trigger
CREATE TRIGGER update_vendor_permissions_updated_at
  BEFORE UPDATE ON public.vendor_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();