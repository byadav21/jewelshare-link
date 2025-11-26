-- Add brand theme field to vendor profiles
ALTER TABLE vendor_profiles
ADD COLUMN brand_theme TEXT DEFAULT 'custom' CHECK (brand_theme IN ('elegant', 'modern', 'classic', 'custom'));