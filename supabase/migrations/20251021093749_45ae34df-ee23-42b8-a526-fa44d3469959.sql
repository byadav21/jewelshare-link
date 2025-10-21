-- Remove vendor data for super admin vijayrai0302@gmail.com
-- This account should only have admin role, not vendor permissions/profile

-- Delete vendor permissions
DELETE FROM public.vendor_permissions 
WHERE user_id = 'ed20f1ec-ca8d-476d-a4b0-534af3c88f90';

-- Delete vendor profile
DELETE FROM public.vendor_profiles 
WHERE user_id = 'ed20f1ec-ca8d-476d-a4b0-534af3c88f90';