-- Add geolocation columns to guest_calculator_usage table
ALTER TABLE public.guest_calculator_usage 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Create index for efficient country/region queries
CREATE INDEX IF NOT EXISTS idx_guest_calculator_country_region 
ON public.guest_calculator_usage(country, region, calculator_type);