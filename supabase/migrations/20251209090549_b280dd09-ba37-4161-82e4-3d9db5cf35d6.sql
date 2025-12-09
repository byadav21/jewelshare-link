-- Add USD exchange rate column to vendor_profiles
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS usd_exchange_rate numeric DEFAULT 89.50;

-- Add comment for clarity
COMMENT ON COLUMN public.vendor_profiles.usd_exchange_rate IS 'USD to INR exchange rate for currency conversion';
