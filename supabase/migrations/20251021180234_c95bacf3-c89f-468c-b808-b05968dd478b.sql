-- Add gold rate tracking to vendor profiles
ALTER TABLE vendor_profiles
ADD COLUMN IF NOT EXISTS gold_rate_per_10g NUMERIC DEFAULT 85000,
ADD COLUMN IF NOT EXISTS gold_rate_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();