-- Add logo_url field to vendor_profiles table
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN vendor_profiles.logo_url IS 'URL to the vendor brand logo image';