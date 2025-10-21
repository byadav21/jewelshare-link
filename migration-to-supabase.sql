-- =====================================================
-- COMPLETE SUPABASE MIGRATION SCRIPT
-- Jewelry Catalog Application
-- =====================================================
-- Run this script in your new Supabase project's SQL Editor
-- Make sure to run it in order from top to bottom
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.app_role AS ENUM ('admin', 'team_member', 'vendor');

-- =====================================================
-- TABLES
-- =====================================================

-- Vendor Profiles
CREATE TABLE public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  business_name TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT,
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  instagram_qr_url TEXT,
  whatsapp_qr_url TEXT,
  gold_rate_24k_per_gram NUMERIC DEFAULT 12978,
  gold_rate_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Approval Status
CREATE TABLE public.user_approval_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  status approval_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  business_name TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Vendor Permissions
CREATE TABLE public.vendor_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  can_add_products BOOLEAN DEFAULT TRUE,
  can_import_data BOOLEAN DEFAULT TRUE,
  can_share_catalog BOOLEAN DEFAULT TRUE,
  can_manage_team BOOLEAN DEFAULT FALSE,
  can_view_interests BOOLEAN DEFAULT TRUE,
  can_delete_products BOOLEAN DEFAULT TRUE,
  can_edit_products BOOLEAN DEFAULT TRUE,
  can_edit_profile BOOLEAN DEFAULT TRUE,
  can_view_catalog BOOLEAN DEFAULT TRUE,
  can_add_vendor_details BOOLEAN DEFAULT TRUE,
  can_view_share_links BOOLEAN DEFAULT TRUE,
  can_manage_share_links BOOLEAN DEFAULT TRUE,
  can_view_sessions BOOLEAN DEFAULT TRUE,
  can_manage_sessions BOOLEAN DEFAULT TRUE,
  can_view_custom_orders BOOLEAN DEFAULT TRUE,
  can_manage_custom_orders BOOLEAN DEFAULT FALSE,
  max_active_sessions INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT,
  product_type TEXT,
  metal_type TEXT,
  gemstone TEXT,
  color TEXT,
  clarity TEXT,
  diamond_color TEXT,
  weight_grams NUMERIC,
  net_weight NUMERIC,
  diamond_weight NUMERIC,
  d_wt_1 NUMERIC,
  d_wt_2 NUMERIC,
  purity_fraction_used NUMERIC,
  d_rate_1 NUMERIC,
  pointer_diamond NUMERIC,
  d_value NUMERIC,
  mkg NUMERIC,
  per_carat_price NUMERIC,
  gold_per_gram_price NUMERIC,
  certification_cost NUMERIC,
  gemstone_cost NUMERIC,
  cost_price NUMERIC NOT NULL,
  retail_price NUMERIC NOT NULL,
  total_usd NUMERIC,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  image_url_2 TEXT,
  image_url_3 TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Share Links
CREATE TABLE public.share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  markup_percentage NUMERIC DEFAULT 0,
  markdown_percentage NUMERIC DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  show_vendor_details BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Interests
CREATE TABLE public.product_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  share_link_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catalog Inquiries
CREATE TABLE public.catalog_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Orders
CREATE TABLE public.custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  design_description TEXT NOT NULL,
  metal_type TEXT,
  gemstone_preference TEXT,
  budget_range TEXT,
  reference_images TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_approval_status
    WHERE user_id = _user_id
      AND status = 'approved'
  )
$$;

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to handle vendor profile updated_at
CREATE OR REPLACE FUNCTION public.handle_vendor_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to validate share link expiration
CREATE OR REPLACE FUNCTION public.validate_share_link_expiration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Expiration date must be in the future';
  END IF;
  RETURN NEW;
END;
$$;

-- Function to create default vendor permissions
CREATE OR REPLACE FUNCTION public.create_default_vendor_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create default permissions when a user is approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.vendor_permissions (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to handle new user approval
CREATE OR REPLACE FUNCTION public.handle_new_user_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_approval_status (user_id, status)
  VALUES (NEW.id, 'pending');
  RETURN NEW;
END;
$$;

-- Function to cleanup old sessions
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE last_activity < NOW() - INTERVAL '30 days';
END;
$$;

-- Function to hard delete products (admin only)
CREATE OR REPLACE FUNCTION public.hard_delete_products(product_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow admins to hard delete
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can perform hard deletes';
  END IF;

  DELETE FROM public.products
  WHERE id = ANY(product_ids)
  AND deleted_at IS NOT NULL;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for vendor_profiles updated_at
CREATE TRIGGER update_vendor_profiles_updated_at
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vendor_profile_updated_at();

-- Trigger for vendor_permissions updated_at
CREATE TRIGGER update_vendor_permissions_updated_at
  BEFORE UPDATE ON public.vendor_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for custom_orders updated_at
CREATE TRIGGER update_custom_orders_updated_at
  BEFORE UPDATE ON public.custom_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for share link expiration validation
CREATE TRIGGER validate_share_link_expiration_trigger
  BEFORE INSERT OR UPDATE ON public.share_links
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_share_link_expiration();

-- Trigger to create default permissions on approval
CREATE TRIGGER create_default_permissions_on_approval
  AFTER INSERT OR UPDATE ON public.user_approval_status
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_vendor_permissions();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_approval_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- VENDOR PROFILES POLICIES
CREATE POLICY "Users and team members can view vendor profiles"
  ON public.vendor_profiles FOR SELECT
  USING (
    auth.uid() = user_id 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'team_member'::app_role)
  );

CREATE POLICY "Users can insert their own vendor profile"
  ON public.vendor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor profile"
  ON public.vendor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- USER APPROVAL STATUS POLICIES
CREATE POLICY "Users can view their own approval status"
  ON public.user_approval_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all approval statuses"
  ON public.user_approval_status FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert their own approval status"
  ON public.user_approval_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update approval statuses"
  ON public.user_approval_status FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- USER ROLES POLICIES
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- VENDOR PERMISSIONS POLICIES
CREATE POLICY "Users can view their own permissions"
  ON public.vendor_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions"
  ON public.vendor_permissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert permissions"
  ON public.vendor_permissions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update permissions"
  ON public.vendor_permissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- PRODUCTS POLICIES
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (
    (auth.uid() = user_id AND deleted_at IS NULL) 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can insert their own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- SHARE LINKS POLICIES
CREATE POLICY "Users can view their own share links"
  ON public.share_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and team members can create share links"
  ON public.share_links FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'team_member'::app_role))
  );

CREATE POLICY "Users can update their own share links"
  ON public.share_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share links"
  ON public.share_links FOR DELETE
  USING (auth.uid() = user_id);

-- PRODUCT INTERESTS POLICIES
CREATE POLICY "Anyone can insert interests"
  ON public.product_interests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only share link owners can view interests"
  ON public.product_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM share_links
      WHERE share_links.id = product_interests.share_link_id
      AND share_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update interests"
  ON public.product_interests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete interests"
  ON public.product_interests FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- CATALOG INQUIRIES POLICIES
CREATE POLICY "Anyone can insert inquiries"
  ON public.catalog_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only share link owners can view inquiries"
  ON public.catalog_inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM share_links
      WHERE share_links.id = catalog_inquiries.share_link_id
      AND share_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update inquiries"
  ON public.catalog_inquiries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete inquiries"
  ON public.catalog_inquiries FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- CUSTOM ORDERS POLICIES
CREATE POLICY "Anyone can submit custom orders"
  ON public.custom_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all custom orders"
  ON public.custom_orders FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update custom orders"
  ON public.custom_orders FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- USER SESSIONS POLICIES
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions"
  ON public.user_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admins and team members can view all sessions"
  ON public.user_sessions FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'team_member'::app_role)
  );

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage bucket for vendor QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-qr-codes', 'vendor-qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for vendor-qr-codes bucket
CREATE POLICY "Public can view QR codes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-qr-codes');

CREATE POLICY "Authenticated users can upload QR codes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-qr-codes' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own QR codes"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vendor-qr-codes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own QR codes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vendor-qr-codes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- INDEXES (for performance)
-- =====================================================

CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_deleted_at ON public.products(deleted_at);
CREATE INDEX idx_share_links_user_id ON public.share_links(user_id);
CREATE INDEX idx_share_links_share_token ON public.share_links(share_token);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions(last_activity);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Export data from your current database
-- 2. Import data into this new database
-- 3. Update your frontend .env file with new Supabase credentials
-- 4. Configure auth settings in Supabase dashboard
-- 5. Deploy edge functions (if needed)
-- =====================================================
