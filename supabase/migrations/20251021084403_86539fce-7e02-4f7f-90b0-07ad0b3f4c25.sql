-- Add soft delete column to products table
ALTER TABLE public.products
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Add index for better performance on soft delete queries
CREATE INDEX idx_products_deleted_at ON public.products(deleted_at);

-- Add enabled/disabled status to user_approval_status
ALTER TABLE public.user_approval_status
ADD COLUMN is_enabled boolean DEFAULT true;

-- Update RLS policies for products to exclude soft-deleted items for vendors
DROP POLICY IF EXISTS "Admins and team members can view products" ON public.products;

CREATE POLICY "Admins and team members can view products" ON public.products
FOR SELECT USING (
  (auth.uid() = user_id AND deleted_at IS NULL) OR 
  (has_role(auth.uid(), 'admin'::app_role)) OR 
  (has_role(auth.uid(), 'team_member'::app_role) AND deleted_at IS NULL)
);

-- Create function for hard delete (admin only)
CREATE OR REPLACE FUNCTION public.hard_delete_products(product_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to hard delete
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can perform hard deletes';
  END IF;

  DELETE FROM public.products
  WHERE id = ANY(product_ids)
  AND deleted_at IS NOT NULL;
END;
$$;