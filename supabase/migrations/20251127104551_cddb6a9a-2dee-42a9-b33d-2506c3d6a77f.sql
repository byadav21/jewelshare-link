-- Add 'essentials' to the subscription_plan enum
ALTER TYPE public.subscription_plan ADD VALUE IF NOT EXISTS 'essentials';

-- Add trial_ends_at column to vendor_permissions to track free trial period
ALTER TABLE public.vendor_permissions ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Update the permissions trigger function to include essentials plan
CREATE OR REPLACE FUNCTION public.update_permissions_for_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Set permissions based on plan
  CASE NEW.subscription_plan
    WHEN 'essentials' THEN
      -- Essentials: Calculator access + read-only catalog during trial
      NEW.max_products := 0; -- Cannot add products
      NEW.max_share_links := 0; -- Cannot create share links
      NEW.max_team_members := 0;
      NEW.max_product_images := 0;
      NEW.max_active_sessions := 2;
      NEW.can_add_products := false;
      NEW.can_view_catalog := true; -- Read-only catalog access
      NEW.can_edit_products := false;
      NEW.can_delete_products := false;
      NEW.can_share_catalog := false;
      NEW.can_view_share_links := false;
      NEW.can_manage_share_links := false;
      NEW.can_view_interests := false;
      NEW.can_add_vendor_details := true; -- Can manage profile
      NEW.can_edit_profile := true;
      NEW.can_view_custom_orders := false;
      NEW.can_manage_custom_orders := false;
      NEW.can_import_data := false;
      NEW.can_manage_team := false;
      NEW.can_view_sessions := false;
      NEW.can_manage_sessions := false;
      -- Set 30-day trial if not already set
      IF NEW.trial_ends_at IS NULL THEN
        NEW.trial_ends_at := NOW() + INTERVAL '30 days';
      END IF;
      
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
      NEW.max_product_images := 999999;
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
      NEW.max_products := 999999;
      NEW.max_share_links := 999999;
      NEW.max_team_members := 999999;
      NEW.max_product_images := 999999;
      NEW.max_active_sessions := 999999;
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
$function$;