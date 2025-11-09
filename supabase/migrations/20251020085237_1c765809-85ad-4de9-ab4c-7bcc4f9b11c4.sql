-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own vendor profile" ON public.vendor_profiles;

-- Create a new policy that allows:
-- 1. Users to view their own vendor profile
-- 2. Team members and admins to view any vendor profile
CREATE POLICY "Users and team members can view vendor profiles"
ON public.vendor_profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'team_member'::app_role)
);