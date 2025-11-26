-- Add branding color fields to vendor_profiles for PDF customization
ALTER TABLE vendor_profiles
ADD COLUMN IF NOT EXISTS primary_brand_color TEXT DEFAULT '#4F46E5',
ADD COLUMN IF NOT EXISTS secondary_brand_color TEXT DEFAULT '#8B5CF6',
ADD COLUMN IF NOT EXISTS brand_tagline TEXT;