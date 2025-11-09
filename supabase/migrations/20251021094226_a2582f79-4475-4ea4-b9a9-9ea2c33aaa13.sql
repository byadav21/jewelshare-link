-- Ensure all admin users can access all vendor features
-- by creating vendor_permissions records for them

-- Insert vendor permissions for all admin users who don't have them yet
INSERT INTO public.vendor_permissions (
  user_id,
  can_view_catalog,
  can_add_products,
  can_edit_products,
  can_delete_products,
  can_import_data,
  can_share_catalog,
  can_manage_team,
  can_view_interests,
  can_edit_profile,
  can_view_custom_orders,
  can_manage_custom_orders,
  can_add_vendor_details,
  can_view_share_links,
  can_manage_share_links,
  can_view_sessions,
  can_manage_sessions
)
SELECT 
  ur.user_id,
  true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true
FROM user_roles ur
WHERE ur.role = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM vendor_permissions vp WHERE vp.user_id = ur.user_id
);