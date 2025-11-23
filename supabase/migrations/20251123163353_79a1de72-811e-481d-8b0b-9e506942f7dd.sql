-- Add subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'professional', 'enterprise');

-- Add plan column to vendor_permissions
ALTER TABLE public.vendor_permissions
ADD COLUMN subscription_plan subscription_plan NOT NULL DEFAULT 'starter',
ADD COLUMN plan_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN plan_updated_by UUID;

-- Add limits based on plan
ALTER TABLE public.vendor_permissions
ADD COLUMN max_products INTEGER DEFAULT 100,
ADD COLUMN max_share_links INTEGER DEFAULT 1,
ADD COLUMN max_team_members INTEGER DEFAULT 0,
ADD COLUMN max_product_images INTEGER DEFAULT 3;

-- Function to update plan permissions based on tier
CREATE OR REPLACE FUNCTION public.update_permissions_for_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Set permissions based on plan
  CASE NEW.subscription_plan
    WHEN 'starter' THEN
      NEW.max_products := 100;
      NEW.max_share_links := 1;
      NEW.max_team_members := 0;
      NEW.max_product_images := 3;
      NEW.max_active_sessions := 1;
      NEW.can_add_products := true;
      NEW.can_view_catalog := true;
      NEW.can_edit_products := true;
      NEW.can_delete_products := true;
      NEW.can_share_catalog := true;
      NEW.can_view_share_links := true;
      NEW.can_manage_share_links := true;
      NEW.can_view_interests := true;
      NEW.can_add_vendor_details := true;
      NEW.can_edit_profile := true;
      -- Starter limitations
      NEW.can_manage_team := false;
      NEW.can_view_custom_orders := false;
      NEW.can_manage_custom_orders := false;
      NEW.can_import_data := false;
      NEW.can_view_sessions := false;
      NEW.can_manage_sessions := false;
      
    WHEN 'professional' THEN
      NEW.max_products := 1000;
      NEW.max_share_links := 10;
      NEW.max_team_members := 3;
      NEW.max_product_images := 999999; -- Unlimited
      NEW.max_active_sessions := 3;
      NEW.can_add_products := true;
      NEW.can_view_catalog := true;
      NEW.can_edit_products := true;
      NEW.can_delete_products := true;
      NEW.can_share_catalog := true;
      NEW.can_view_share_links := true;
      NEW.can_manage_share_links := true;
      NEW.can_view_interests := true;
      NEW.can_add_vendor_details := true;
      NEW.can_edit_profile := true;
      NEW.can_view_custom_orders := true;
      NEW.can_manage_custom_orders := true;
      NEW.can_import_data := true;
      NEW.can_manage_team := true;
      NEW.can_view_sessions := true;
      NEW.can_manage_sessions := true;
      
    WHEN 'enterprise' THEN
      NEW.max_products := 999999; -- Unlimited
      NEW.max_share_links := 999999; -- Unlimited
      NEW.max_team_members := 999999; -- Unlimited
      NEW.max_product_images := 999999; -- Unlimited
      NEW.max_active_sessions := 999999; -- Unlimited
      NEW.can_add_products := true;
      NEW.can_view_catalog := true;
      NEW.can_edit_products := true;
      NEW.can_delete_products := true;
      NEW.can_share_catalog := true;
      NEW.can_view_share_links := true;
      NEW.can_manage_share_links := true;
      NEW.can_view_interests := true;
      NEW.can_add_vendor_details := true;
      NEW.can_edit_profile := true;
      NEW.can_view_custom_orders := true;
      NEW.can_manage_custom_orders := true;
      NEW.can_import_data := true;
      NEW.can_manage_team := true;
      NEW.can_view_sessions := true;
      NEW.can_manage_sessions := true;
  END CASE;
  
  NEW.plan_updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update permissions when plan changes
CREATE TRIGGER update_permissions_on_plan_change
BEFORE INSERT OR UPDATE OF subscription_plan ON public.vendor_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_permissions_for_plan();

-- Update existing records to starter plan
UPDATE public.vendor_permissions SET subscription_plan = 'starter' WHERE subscription_plan IS NULL;