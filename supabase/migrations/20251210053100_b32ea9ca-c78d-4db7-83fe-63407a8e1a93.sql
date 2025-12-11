-- Add silver rate column to vendor_profiles
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS silver_rate_per_gram numeric DEFAULT 95;

-- Add platinum rate column to vendor_profiles
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS platinum_rate_per_gram numeric DEFAULT 3200;