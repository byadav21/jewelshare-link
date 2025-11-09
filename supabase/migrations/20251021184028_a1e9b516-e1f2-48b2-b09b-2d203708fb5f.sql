-- Add missing fields from Excel bulk upload to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS diamond_color text,
ADD COLUMN IF NOT EXISTS d_wt_1 numeric,
ADD COLUMN IF NOT EXISTS d_wt_2 numeric,
ADD COLUMN IF NOT EXISTS purity_fraction_used numeric,
ADD COLUMN IF NOT EXISTS d_rate_1 numeric,
ADD COLUMN IF NOT EXISTS pointer_diamond numeric,
ADD COLUMN IF NOT EXISTS d_value numeric,
ADD COLUMN IF NOT EXISTS mkg numeric,
ADD COLUMN IF NOT EXISTS certification_cost numeric,
ADD COLUMN IF NOT EXISTS gemstone_cost numeric,
ADD COLUMN IF NOT EXISTS total_usd numeric,
ADD COLUMN IF NOT EXISTS product_type text,
ADD COLUMN IF NOT EXISTS image_url_3 text;

-- Add comment to clarify the diamond_weight field usage
COMMENT ON COLUMN public.products.diamond_weight IS 'Total diamond weight (T DWT) in carats';