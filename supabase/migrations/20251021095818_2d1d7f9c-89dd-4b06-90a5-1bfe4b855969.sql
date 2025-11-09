-- Test disabling some permissions for the main vendor
UPDATE public.vendor_permissions
SET 
  can_add_products = false,
  can_import_data = false,
  can_manage_team = false,
  updated_at = NOW()
WHERE user_id = 'b40b1a42-7a00-4218-b700-854264fba7d5';