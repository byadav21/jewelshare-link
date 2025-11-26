-- Update brand theme constraint to include new themes
ALTER TABLE vendor_profiles
DROP CONSTRAINT IF EXISTS vendor_profiles_brand_theme_check;

ALTER TABLE vendor_profiles
ADD CONSTRAINT vendor_profiles_brand_theme_check 
CHECK (brand_theme IN ('elegant', 'modern', 'classic', 'luxury', 'minimalist', 'vibrant', 'custom'));