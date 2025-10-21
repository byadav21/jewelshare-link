-- Enable Add Product and Import Data permissions for vendor
UPDATE public.vendor_permissions
SET 
  can_add_products = true,
  can_import_data = true,
  updated_at = NOW()
WHERE user_id = 'b40b1a42-7a00-4218-b700-854264fba7d5';