-- Remove admin role from vijay@gemhub.in (vendor account)
DELETE FROM public.user_roles 
WHERE user_id = 'b40b1a42-7a00-4218-b700-854264fba7d5' 
AND role = 'admin';

-- Ensure vijayrai0302@gmail.com is the super admin
-- This account already has admin role, no changes needed

-- Add comment for clarity
COMMENT ON TABLE public.user_roles IS 'Super admin: vijayrai0302@gmail.com (ed20f1ec-ca8d-476d-a4b0-534af3c88f90), Vendor: vijay@gemhub.in (b40b1a42-7a00-4218-b700-854264fba7d5)';