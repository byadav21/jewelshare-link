-- Strengthen RLS policies for catalog_inquiries table to prevent data exposure

-- Drop existing policies to recreate them with stricter rules
DROP POLICY IF EXISTS "Anyone can insert inquiries" ON catalog_inquiries;
DROP POLICY IF EXISTS "Users can view inquiries for their share links" ON catalog_inquiries;

-- Recreate INSERT policy (anyone can submit inquiries - this is intentional for public forms)
CREATE POLICY "Anyone can insert inquiries"
ON catalog_inquiries
FOR INSERT
WITH CHECK (true);

-- Strengthen SELECT policy to ensure only share link owners can view inquiries
CREATE POLICY "Only share link owners can view inquiries"
ON catalog_inquiries
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM share_links
    WHERE share_links.id = catalog_inquiries.share_link_id
    AND share_links.user_id = auth.uid()
  )
);

-- Explicitly deny UPDATE (only admins should update if needed)
CREATE POLICY "Only admins can update inquiries"
ON catalog_inquiries
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Explicitly deny DELETE (only admins should delete)
CREATE POLICY "Only admins can delete inquiries"
ON catalog_inquiries
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add the same protections to product_interests table
DROP POLICY IF EXISTS "Anyone can insert interests" ON product_interests;
DROP POLICY IF EXISTS "Users can view interests for their share links" ON product_interests;

-- Recreate INSERT policy for product_interests
CREATE POLICY "Anyone can insert interests"
ON product_interests
FOR INSERT
WITH CHECK (true);

-- Strengthen SELECT policy for product_interests
CREATE POLICY "Only share link owners can view interests"
ON product_interests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM share_links
    WHERE share_links.id = product_interests.share_link_id
    AND share_links.user_id = auth.uid()
  )
);

-- Explicitly deny UPDATE for product_interests
CREATE POLICY "Only admins can update interests"
ON product_interests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Explicitly deny DELETE for product_interests
CREATE POLICY "Only admins can delete interests"
ON product_interests
FOR DELETE
USING (has_role(auth.uid(), 'admin'));