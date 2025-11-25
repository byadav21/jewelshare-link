-- Add shared_categories column to share_links table
ALTER TABLE share_links 
ADD COLUMN shared_categories text[] DEFAULT ARRAY['Jewellery', 'Gemstones', 'Loose Diamonds']::text[];

-- Add comment to describe the column
COMMENT ON COLUMN share_links.shared_categories IS 'Array of product types to include in this share link: Jewellery, Gemstones, Loose Diamonds';