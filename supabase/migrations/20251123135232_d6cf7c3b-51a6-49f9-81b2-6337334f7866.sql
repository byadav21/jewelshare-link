-- Add new columns for Gemstones and Diamonds to products table

-- Gemstone specific fields
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS gemstone_name TEXT,
ADD COLUMN IF NOT EXISTS gemstone_type TEXT,
ADD COLUMN IF NOT EXISTS carat_weight NUMERIC,
ADD COLUMN IF NOT EXISTS cut TEXT,
ADD COLUMN IF NOT EXISTS polish TEXT,
ADD COLUMN IF NOT EXISTS symmetry TEXT,
ADD COLUMN IF NOT EXISTS measurement TEXT,
ADD COLUMN IF NOT EXISTS certification TEXT,
ADD COLUMN IF NOT EXISTS price_inr NUMERIC;

-- Diamond specific fields
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS diamond_type TEXT, -- Natural / Lab grown
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS shape TEXT,
ADD COLUMN IF NOT EXISTS carat NUMERIC,
ADD COLUMN IF NOT EXISTS color_shade_amount TEXT,
ADD COLUMN IF NOT EXISTS fluorescence TEXT,
ADD COLUMN IF NOT EXISTS ratio TEXT,
ADD COLUMN IF NOT EXISTS lab TEXT,
ADD COLUMN IF NOT EXISTS price_usd NUMERIC;

-- Add comment to explain the multi-category support
COMMENT ON COLUMN public.products.product_type IS 'Product category: Jewellery, Gemstones, or Loose Diamonds';
COMMENT ON COLUMN public.products.price_inr IS 'Price in INR for Gemstones and Diamonds (auto-converted to USD)';
COMMENT ON COLUMN public.products.price_usd IS 'Auto-calculated USD price from INR';