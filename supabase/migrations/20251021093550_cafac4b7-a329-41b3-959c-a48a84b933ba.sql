-- Create approval status for vijayrai0302@gmail.com super admin
INSERT INTO public.user_approval_status (
  user_id,
  email,
  business_name,
  status,
  reviewed_at,
  is_enabled
)
VALUES (
  'ed20f1ec-ca8d-476d-a4b0-534af3c88f90',
  'vijayrai0302@gmail.com',
  'Super Admin',
  'approved',
  NOW(),
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  status = 'approved',
  business_name = 'Super Admin',
  email = 'vijayrai0302@gmail.com',
  reviewed_at = NOW(),
  is_enabled = true;