-- Delete duplicate user entries while keeping the one with products
-- Keep user_id: b40b1a42-7a00-4218-b700-854264fba7d5 (has 258 products)
-- Delete user_id: ec77032a-fd96-4570-8a70-4cb1ac1d45ed (no business name, 0 products)
-- Delete user_id: ed20f1ec-ca8d-476d-a4b0-534af3c88f90 (duplicate business, 0 products)

-- First delete from vendor_permissions
DELETE FROM public.vendor_permissions 
WHERE user_id IN ('ec77032a-fd96-4570-8a70-4cb1ac1d45ed', 'ed20f1ec-ca8d-476d-a4b0-534af3c88f90');

-- Delete from vendor_profiles
DELETE FROM public.vendor_profiles 
WHERE user_id IN ('ec77032a-fd96-4570-8a70-4cb1ac1d45ed', 'ed20f1ec-ca8d-476d-a4b0-534af3c88f90');

-- Delete from user_roles
DELETE FROM public.user_roles 
WHERE user_id IN ('ec77032a-fd96-4570-8a70-4cb1ac1d45ed', 'ed20f1ec-ca8d-476d-a4b0-534af3c88f90');

-- Delete from user_approval_status
DELETE FROM public.user_approval_status 
WHERE user_id IN ('ec77032a-fd96-4570-8a70-4cb1ac1d45ed', 'ed20f1ec-ca8d-476d-a4b0-534af3c88f90');