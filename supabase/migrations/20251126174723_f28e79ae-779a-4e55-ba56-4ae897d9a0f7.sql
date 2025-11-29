-- Fix RLS policy for products UPDATE to support soft deletes
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);