-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;

-- Recreate the update policy with both USING and WITH CHECK clauses
CREATE POLICY "Users can update their own products"
ON public.products
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);