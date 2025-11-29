-- Fix SELECT policy to allow soft-delete updates by adding grace period
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;

CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (
  (auth.uid() = user_id AND (
    deleted_at IS NULL 
    OR 
    -- Allow viewing during update operation (1 second grace period)
    ABS(EXTRACT(EPOCH FROM (statement_timestamp() - deleted_at))) < 1
  ))
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);