-- Update all products to belong to vijay@gemhub.in
UPDATE products 
SET user_id = 'b40b1a42-7a00-4218-b700-854264fba7d5'
WHERE user_id = 'ed20f1ec-ca8d-476d-a4b0-534af3c88f90';

-- Add session management permissions to vendor_permissions table
ALTER TABLE vendor_permissions 
ADD COLUMN IF NOT EXISTS can_view_sessions boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS can_manage_sessions boolean DEFAULT true;

-- Update RLS policy for user_sessions to allow admins and team members to view all sessions
DROP POLICY IF EXISTS "Admins and team members can view all sessions" ON user_sessions;
CREATE POLICY "Admins and team members can view all sessions"
ON user_sessions
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'team_member'::app_role)
);

-- Update RLS policy for products to prevent team members from viewing products
DROP POLICY IF EXISTS "Admins and team members can view products" ON products;
CREATE POLICY "Admins can view all products"
ON products
FOR SELECT
USING (
  (auth.uid() = user_id AND deleted_at IS NULL) OR 
  has_role(auth.uid(), 'admin'::app_role)
);