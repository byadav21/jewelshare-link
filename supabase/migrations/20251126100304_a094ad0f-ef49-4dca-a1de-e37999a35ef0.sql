-- First, drop all existing policies on products table
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;

-- Recreate all policies with proper USING and WITH CHECK clauses

-- SELECT policy (view products)
CREATE POLICY "Users can view their own products"
ON public.products
FOR SELECT
USING (
  (auth.uid() = user_id AND deleted_at IS NULL) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- INSERT policy
CREATE POLICY "Users can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy (including soft delete)
CREATE POLICY "Users can update their own products"
ON public.products
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE policy (hard delete)
CREATE POLICY "Users can delete their own products"
ON public.products
FOR DELETE
USING (auth.uid() = user_id);