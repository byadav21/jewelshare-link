-- Grant super admin privileges to vijayrai0302@gmail.com
-- User ID: ed20f1ec-ca8d-476d-a4b0-534af3c88f90

-- 1. Approve the user
UPDATE public.user_approval_status
SET status = 'approved',
    reviewed_at = NOW(),
    business_name = COALESCE(business_name, 'Super Admin')
WHERE user_id = 'ed20f1ec-ca8d-476d-a4b0-534af3c88f90';

-- 2. Grant admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('ed20f1ec-ca8d-476d-a4b0-534af3c88f90', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Create vendor permissions with full access
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
VALUES (
  'ed20f1ec-ca8d-476d-a4b0-534af3c88f90',
  true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true
)
ON CONFLICT (user_id) 
DO UPDATE SET
  can_view_catalog = true,
  can_add_products = true,
  can_edit_products = true,
  can_delete_products = true,
  can_import_data = true,
  can_share_catalog = true,
  can_manage_team = true,
  can_view_interests = true,
  can_edit_profile = true,
  can_view_custom_orders = true,
  can_manage_custom_orders = true,
  can_add_vendor_details = true,
  can_view_share_links = true,
  can_manage_share_links = true,
  can_view_sessions = true,
  can_manage_sessions = true;