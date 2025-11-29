-- Add making charges field to vendor_profiles
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS making_charges_per_gram numeric DEFAULT 0;