-- Update gold rate to be per gram (24K) instead of per 10g
ALTER TABLE vendor_profiles
DROP COLUMN IF EXISTS gold_rate_per_10g,
ADD COLUMN IF NOT EXISTS gold_rate_24k_per_gram NUMERIC DEFAULT 12978;