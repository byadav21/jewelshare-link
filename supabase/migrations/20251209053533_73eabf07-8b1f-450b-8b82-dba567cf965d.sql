-- Add SELECT policy for vendors to view custom orders from their share links
CREATE POLICY "Share link owners can view their custom orders"
ON public.custom_orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM share_links
    WHERE share_links.id = custom_orders.share_link_id
    AND share_links.user_id = auth.uid()
  )
);