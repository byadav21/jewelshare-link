-- Add seller categories to vendor profiles
ALTER TABLE public.vendor_profiles
ADD COLUMN IF NOT EXISTS seller_categories TEXT[] DEFAULT ARRAY['Jewellery']::TEXT[];

-- Add approved categories to user approval status
ALTER TABLE public.user_approval_status
ADD COLUMN IF NOT EXISTS approved_categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment for clarity
COMMENT ON COLUMN vendor_profiles.seller_categories IS 'Categories this seller deals in: Jewellery, Gemstones, Loose Diamonds';
COMMENT ON COLUMN user_approval_status.approved_categories IS 'Categories approved by admin for this seller';