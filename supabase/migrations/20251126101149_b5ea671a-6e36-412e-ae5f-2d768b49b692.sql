-- Drop and recreate the UPDATE policy with a simpler approach
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;

-- New UPDATE policy: check ownership in USING, allow any updates to owned products
CREATE POLICY "Users can update their own products"
ON public.products
FOR UPDATE
USING (auth.uid() = user_id);