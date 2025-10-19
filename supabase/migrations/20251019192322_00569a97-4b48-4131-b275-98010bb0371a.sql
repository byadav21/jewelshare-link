-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'team_member');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update products RLS policies to allow team members to view
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;

CREATE POLICY "Admins and team members can view products"
ON public.products
FOR SELECT
USING (
  -- User owns the product
  auth.uid() = user_id 
  OR 
  -- User is an admin
  public.has_role(auth.uid(), 'admin')
  OR
  -- User is a team member (can view all products to create share links)
  public.has_role(auth.uid(), 'team_member')
);

-- Update share_links RLS policies
DROP POLICY IF EXISTS "Users can create share links" ON public.share_links;
DROP POLICY IF EXISTS "Users can view their own share links" ON public.share_links;
DROP POLICY IF EXISTS "Users can update their own share links" ON public.share_links;
DROP POLICY IF EXISTS "Users can delete their own share links" ON public.share_links;

CREATE POLICY "Admins and team members can create share links"
ON public.share_links
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'team_member')
  )
);

CREATE POLICY "Users can view their own share links"
ON public.share_links
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own share links"
ON public.share_links
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own share links"
ON public.share_links
FOR DELETE
USING (auth.uid() = user_id);

-- Update product_interests RLS to allow team members to view interests on their share links
DROP POLICY IF EXISTS "Owners can view interests for their products" ON public.product_interests;

CREATE POLICY "Users can view interests for their share links"
ON public.product_interests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.share_links sl
    WHERE sl.id = product_interests.share_link_id
    AND sl.user_id = auth.uid()
  )
);

-- Update catalog_inquiries RLS similarly
DROP POLICY IF EXISTS "Owners can view inquiries for their catalogs" ON public.catalog_inquiries;

CREATE POLICY "Users can view inquiries for their share links"
ON public.catalog_inquiries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.share_links sl
    WHERE sl.id = catalog_inquiries.share_link_id
    AND sl.user_id = auth.uid()
  )
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);