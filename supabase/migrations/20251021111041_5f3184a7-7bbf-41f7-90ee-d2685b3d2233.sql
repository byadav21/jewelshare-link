-- Add detailed product specification columns
ALTER TABLE products
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS clarity TEXT,
ADD COLUMN IF NOT EXISTS per_carat_price NUMERIC,
ADD COLUMN IF NOT EXISTS gold_per_gram_price NUMERIC;