CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'team_member'
);


--
-- Name: approval_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: subscription_plan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_plan AS ENUM (
    'starter',
    'professional',
    'enterprise',
    'essentials'
);


--
-- Name: check_and_award_milestones(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_and_award_milestones() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_user_id UUID;
  v_product_count INTEGER;
  v_share_link_count INTEGER;
  v_total_views INTEGER;
BEGIN
  v_user_id := NEW.user_id;
  
  -- Check product milestones
  IF TG_TABLE_NAME = 'products' THEN
    SELECT COUNT(*) INTO v_product_count
    FROM public.products
    WHERE user_id = v_user_id AND deleted_at IS NULL;
    
    -- Award milestone points for product counts
    IF v_product_count = 10 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'products_added', 10, 50)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    ELSIF v_product_count = 50 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'products_added', 50, 200)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    ELSIF v_product_count = 100 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'products_added', 100, 500)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    END IF;
  END IF;
  
  -- Check share link milestones
  IF TG_TABLE_NAME = 'share_links' THEN
    SELECT COUNT(*) INTO v_share_link_count
    FROM public.share_links
    WHERE user_id = v_user_id;
    
    IF v_share_link_count = 1 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'first_share_link', 1, 100)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    ELSIF v_share_link_count = 5 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'share_links_created', 5, 250)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: cleanup_old_sessions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_sessions() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE last_activity < NOW() - INTERVAL '30 days';
END;
$$;


--
-- Name: create_default_vendor_permissions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_default_vendor_permissions() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: get_active_points(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_active_points(user_id_param uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  total_active_points INTEGER;
BEGIN
  SELECT COALESCE(SUM(points), 0)
  INTO total_active_points
  FROM public.points_history
  WHERE user_id = user_id_param
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (expired = false);
  
  RETURN total_active_points;
END;
$$;


--
-- Name: get_expiring_points(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_expiring_points(user_id_param uuid) RETURNS TABLE(points integer, expires_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT ph.points, ph.expires_at
  FROM public.points_history ph
  WHERE ph.user_id = user_id_param
    AND ph.points > 0
    AND ph.expired = false
    AND ph.expires_at IS NOT NULL
    AND ph.expires_at > NOW()
    AND ph.expires_at < NOW() + INTERVAL '30 days'
  ORDER BY ph.expires_at ASC;
END;
$$;


--
-- Name: get_scratch_session_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_scratch_session_id() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT COALESCE(
    current_setting('request.headers', true)::json->>'x-scratch-session-id',
    ''
  )
$$;


--
-- Name: handle_new_user_approval(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_approval() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_approval_status (user_id, status)
  VALUES (NEW.id, 'pending');
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: handle_vendor_profile_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_vendor_profile_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: hard_delete_products(uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.hard_delete_products(product_ids uuid[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_user_approved(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_user_approved(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_approval_status
    WHERE user_id = _user_id
      AND status = 'approved'
  )
$$;


--
-- Name: log_audit(text, text, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_audit(p_action text, p_entity_type text, p_entity_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_details
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;


--
-- Name: update_permissions_for_plan(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_permissions_for_plan() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Set permissions based on plan
  CASE NEW.subscription_plan
    WHEN 'essentials' THEN
      -- Essentials: Calculator access + read-only catalog during trial
      NEW.max_products := 0; -- Cannot add products
      NEW.max_share_links := 0; -- Cannot create share links
      NEW.max_team_members := 0;
      NEW.max_product_images := 0;
      NEW.max_active_sessions := 2;
      NEW.can_add_products := false;
      NEW.can_view_catalog := true; -- Read-only catalog access
      NEW.can_edit_products := false;
      NEW.can_delete_products := false;
      NEW.can_share_catalog := false;
      NEW.can_view_share_links := false;
      NEW.can_manage_share_links := false;
      NEW.can_view_interests := false;
      NEW.can_add_vendor_details := true; -- Can manage profile
      NEW.can_edit_profile := true;
      NEW.can_view_custom_orders := false;
      NEW.can_manage_custom_orders := false;
      NEW.can_import_data := false;
      NEW.can_manage_team := false;
      NEW.can_view_sessions := false;
      NEW.can_manage_sessions := false;
      -- Set 30-day trial if not already set
      IF NEW.trial_ends_at IS NULL THEN
        NEW.trial_ends_at := NOW() + INTERVAL '30 days';
      END IF;
      
    WHEN 'starter' THEN
      NEW.max_products := 100;
      NEW.max_share_links := 1;
      NEW.max_team_members := 0;
      NEW.max_product_images := 3;
      NEW.max_active_sessions := 1;
      NEW.can_add_products := true;
      NEW.can_view_catalog := true;
      NEW.can_edit_products := true;
      NEW.can_delete_products := true;
      NEW.can_share_catalog := true;
      NEW.can_view_share_links := true;
      NEW.can_manage_share_links := true;
      NEW.can_view_interests := true;
      NEW.can_add_vendor_details := true;
      NEW.can_edit_profile := true;
      NEW.can_manage_team := false;
      NEW.can_view_custom_orders := false;
      NEW.can_manage_custom_orders := false;
      NEW.can_import_data := false;
      NEW.can_view_sessions := false;
      NEW.can_manage_sessions := false;
      
    WHEN 'professional' THEN
      NEW.max_products := 1000;
      NEW.max_share_links := 10;
      NEW.max_team_members := 3;
      NEW.max_product_images := 999999;
      NEW.max_active_sessions := 3;
      NEW.can_add_products := true;
      NEW.can_view_catalog := true;
      NEW.can_edit_products := true;
      NEW.can_delete_products := true;
      NEW.can_share_catalog := true;
      NEW.can_view_share_links := true;
      NEW.can_manage_share_links := true;
      NEW.can_view_interests := true;
      NEW.can_add_vendor_details := true;
      NEW.can_edit_profile := true;
      NEW.can_view_custom_orders := true;
      NEW.can_manage_custom_orders := true;
      NEW.can_import_data := true;
      NEW.can_manage_team := true;
      NEW.can_view_sessions := true;
      NEW.can_manage_sessions := true;
      
    WHEN 'enterprise' THEN
      NEW.max_products := 999999;
      NEW.max_share_links := 999999;
      NEW.max_team_members := 999999;
      NEW.max_product_images := 999999;
      NEW.max_active_sessions := 999999;
      NEW.can_add_products := true;
      NEW.can_view_catalog := true;
      NEW.can_edit_products := true;
      NEW.can_delete_products := true;
      NEW.can_share_catalog := true;
      NEW.can_view_share_links := true;
      NEW.can_manage_share_links := true;
      NEW.can_view_interests := true;
      NEW.can_add_vendor_details := true;
      NEW.can_edit_profile := true;
      NEW.can_view_custom_orders := true;
      NEW.can_manage_custom_orders := true;
      NEW.can_import_data := true;
      NEW.can_manage_team := true;
      NEW.can_view_sessions := true;
      NEW.can_manage_sessions := true;
  END CASE;
  
  NEW.plan_updated_at := now();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_vendor_points_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_vendor_points_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: validate_share_link_expiration(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_share_link_expiration() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Expiration date must be in the future';
  END IF;
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    details jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: blog_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    blog_post_id uuid NOT NULL,
    author_name text NOT NULL,
    author_email text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    moderated_at timestamp with time zone,
    moderated_by uuid,
    CONSTRAINT blog_comments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'spam'::text])))
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text,
    content text NOT NULL,
    author_name text NOT NULL,
    author_role text,
    author_avatar text,
    cover_image text,
    tags text[],
    category text,
    read_time integer DEFAULT 5,
    published boolean DEFAULT false,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    logo_url text NOT NULL,
    display_order integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: catalog_inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.catalog_inquiries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    share_link_id uuid NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: custom_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    metal_type text,
    gemstone_preference text,
    design_description text NOT NULL,
    budget_range text,
    reference_images text[],
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    share_link_id uuid
);


--
-- Name: diamond_price_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diamond_price_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    price_id uuid NOT NULL,
    shape text NOT NULL,
    carat_range_min numeric NOT NULL,
    carat_range_max numeric NOT NULL,
    color_grade text NOT NULL,
    clarity_grade text NOT NULL,
    cut_grade text NOT NULL,
    old_price_per_carat numeric,
    new_price_per_carat numeric NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    change_type text NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text,
    CONSTRAINT diamond_price_history_change_type_check CHECK ((change_type = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text])))
);


--
-- Name: diamond_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diamond_prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shape text NOT NULL,
    carat_range_min numeric NOT NULL,
    carat_range_max numeric NOT NULL,
    color_grade text NOT NULL,
    clarity_grade text NOT NULL,
    cut_grade text NOT NULL,
    price_per_carat numeric NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    notes text
);


--
-- Name: guest_calculator_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_calculator_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ip_address text NOT NULL,
    calculator_type text NOT NULL,
    used_at timestamp with time zone DEFAULT now() NOT NULL,
    user_agent text,
    country text,
    country_code text,
    region text,
    city text,
    latitude numeric,
    longitude numeric
);


--
-- Name: invoice_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    template_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: manufacturing_cost_estimates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manufacturing_cost_estimates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    estimate_name text NOT NULL,
    net_weight numeric(10,3),
    purity_fraction numeric(5,3),
    gold_rate_24k numeric(12,2),
    making_charges numeric(12,2),
    cad_design_charges numeric(12,2),
    camming_charges numeric(12,2),
    certification_cost numeric(12,2),
    diamond_cost numeric(12,2),
    gemstone_cost numeric(12,2),
    gold_cost numeric(12,2),
    total_cost numeric(12,2),
    profit_margin_percentage numeric(5,2),
    final_selling_price numeric(12,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    reference_images text[] DEFAULT ARRAY[]::text[],
    customer_name text,
    customer_phone text,
    customer_email text,
    customer_address text,
    status text DEFAULT 'draft'::text,
    share_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text),
    estimated_completion_date timestamp with time zone,
    is_customer_visible boolean DEFAULT false,
    invoice_number text,
    invoice_date timestamp with time zone,
    payment_terms text DEFAULT 'Net 30'::text,
    payment_due_date timestamp with time zone,
    invoice_notes text,
    is_invoice_generated boolean DEFAULT false,
    line_items jsonb DEFAULT '[]'::jsonb,
    invoice_status text DEFAULT 'pending'::text,
    payment_date timestamp with time zone,
    last_reminder_sent_at timestamp with time zone,
    estimate_category text DEFAULT 'jewelry'::text,
    is_archived boolean DEFAULT false,
    archived_at timestamp with time zone,
    CONSTRAINT manufacturing_cost_estimates_estimate_category_check CHECK ((estimate_category = ANY (ARRAY['jewelry'::text, 'loose_diamond'::text, 'gemstone'::text]))),
    CONSTRAINT manufacturing_cost_estimates_invoice_status_check CHECK ((invoice_status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text]))),
    CONSTRAINT manufacturing_cost_estimates_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'quoted'::text, 'approved'::text, 'in_production'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    subscribed_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    unsubscribe_token text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: permission_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permission_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    template_config jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: points_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.points_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    points integer NOT NULL,
    action_type text NOT NULL,
    action_details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    expired boolean DEFAULT false
);


--
-- Name: press_releases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.press_releases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    subtitle text,
    content text NOT NULL,
    publication text,
    publication_logo text,
    published_date date NOT NULL,
    external_url text,
    featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_interests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_interests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    share_link_id uuid NOT NULL,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    sku text,
    category text,
    metal_type text,
    gemstone text,
    weight_grams numeric(10,2),
    cost_price numeric(10,2) NOT NULL,
    retail_price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0,
    image_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    diamond_weight numeric,
    net_weight numeric,
    image_url_2 text,
    deleted_at timestamp with time zone,
    color text,
    clarity text,
    per_carat_price numeric,
    gold_per_gram_price numeric,
    diamond_color text,
    d_wt_1 numeric,
    d_wt_2 numeric,
    purity_fraction_used numeric,
    d_rate_1 numeric,
    pointer_diamond numeric,
    d_value numeric,
    mkg numeric,
    certification_cost numeric,
    gemstone_cost numeric,
    total_usd numeric,
    product_type text,
    image_url_3 text,
    delivery_type text DEFAULT 'immediate'::text,
    dispatches_in_days integer,
    gemstone_name text,
    gemstone_type text,
    carat_weight numeric,
    cut text,
    polish text,
    symmetry text,
    measurement text,
    certification text,
    price_inr numeric,
    diamond_type text,
    status text,
    shape text,
    carat numeric,
    color_shade_amount text,
    fluorescence text,
    ratio text,
    lab text,
    price_usd numeric,
    CONSTRAINT products_delivery_type_check CHECK ((delivery_type = ANY (ARRAY['immediate'::text, 'scheduled'::text])))
);


--
-- Name: purchase_inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_inquiries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    share_link_id uuid NOT NULL,
    product_id uuid NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    quantity integer DEFAULT 1,
    message text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT purchase_inquiries_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'contacted'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: redemptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.redemptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reward_id uuid NOT NULL,
    points_spent integer NOT NULL,
    reward_details jsonb,
    status text DEFAULT 'pending'::text,
    redeemed_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    applied_at timestamp with time zone
);


--
-- Name: rewards_catalog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rewards_catalog (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    points_cost integer NOT NULL,
    reward_type text NOT NULL,
    reward_value jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: scratch_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scratch_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    business_name text,
    interest text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: scratch_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scratch_rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    reward_type text NOT NULL,
    reward_value text NOT NULL,
    claimed boolean DEFAULT false,
    claimed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid
);


--
-- Name: share_link_product_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.share_link_product_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    share_link_id uuid NOT NULL,
    product_id uuid NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    viewer_ip text,
    viewer_user_agent text
);


--
-- Name: share_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.share_links (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    share_token text DEFAULT encode(extensions.gen_random_bytes(32), 'base64'::text) NOT NULL,
    markup_percentage numeric(5,2) DEFAULT 0,
    markdown_percentage numeric(5,2) DEFAULT 0,
    expires_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    show_vendor_details boolean DEFAULT true NOT NULL,
    shared_categories text[] DEFAULT ARRAY['Jewellery'::text, 'Gemstones'::text, 'Loose Diamonds'::text]
);


--
-- Name: user_approval_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_approval_status (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    status public.approval_status DEFAULT 'pending'::public.approval_status NOT NULL,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    rejection_reason text,
    business_name text,
    phone text,
    notes text,
    email text,
    is_enabled boolean DEFAULT true,
    approved_categories text[] DEFAULT ARRAY[]::text[]
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id text NOT NULL,
    device_info text,
    ip_address text,
    last_activity timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: vendor_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    milestone_type text NOT NULL,
    milestone_value integer NOT NULL,
    achieved_at timestamp with time zone DEFAULT now() NOT NULL,
    points_awarded integer DEFAULT 0 NOT NULL
);


--
-- Name: vendor_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    can_add_products boolean DEFAULT true,
    can_import_data boolean DEFAULT true,
    can_share_catalog boolean DEFAULT true,
    can_manage_team boolean DEFAULT false,
    can_view_interests boolean DEFAULT true,
    can_delete_products boolean DEFAULT true,
    can_edit_products boolean DEFAULT true,
    can_edit_profile boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    can_view_catalog boolean DEFAULT true,
    can_add_vendor_details boolean DEFAULT true,
    can_view_custom_orders boolean DEFAULT true,
    can_manage_custom_orders boolean DEFAULT false,
    can_view_share_links boolean DEFAULT true,
    can_manage_share_links boolean DEFAULT true,
    can_view_sessions boolean DEFAULT true,
    can_manage_sessions boolean DEFAULT true,
    max_active_sessions integer DEFAULT 3 NOT NULL,
    subscription_plan public.subscription_plan DEFAULT 'starter'::public.subscription_plan NOT NULL,
    plan_updated_at timestamp with time zone DEFAULT now(),
    plan_updated_by uuid,
    max_products integer DEFAULT 100,
    max_share_links integer DEFAULT 1,
    max_team_members integer DEFAULT 0,
    max_product_images integer DEFAULT 3,
    override_plan_limits boolean DEFAULT false,
    trial_ends_at timestamp with time zone
);

ALTER TABLE ONLY public.vendor_permissions REPLICA IDENTITY FULL;


--
-- Name: vendor_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_points (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    current_tier text DEFAULT 'bronze'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vendor_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    business_name text,
    address_line1 text,
    address_line2 text,
    city text,
    state text,
    pincode text,
    country text,
    email text,
    phone text,
    whatsapp_number text,
    instagram_qr_url text,
    whatsapp_qr_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    gold_rate_updated_at timestamp with time zone DEFAULT now(),
    gold_rate_24k_per_gram numeric DEFAULT 12978,
    seller_categories text[] DEFAULT ARRAY['Jewellery'::text],
    logo_url text,
    business_story text,
    certifications text[],
    awards text[],
    making_charges_per_gram numeric DEFAULT 0,
    primary_brand_color text DEFAULT '#4F46E5'::text,
    secondary_brand_color text DEFAULT '#8B5CF6'::text,
    brand_tagline text,
    brand_theme text DEFAULT 'custom'::text,
    usd_exchange_rate numeric DEFAULT 87.50,
    silver_rate_per_gram numeric DEFAULT 95,
    platinum_rate_per_gram numeric DEFAULT 3200,
    CONSTRAINT vendor_profiles_brand_theme_check CHECK ((brand_theme = ANY (ARRAY['elegant'::text, 'modern'::text, 'classic'::text, 'luxury'::text, 'minimalist'::text, 'vibrant'::text, 'custom'::text])))
);


--
-- Name: video_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    share_link_id uuid,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    requested_products text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    wishlist_id uuid NOT NULL,
    product_id uuid NOT NULL,
    share_link_id uuid,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);


--
-- Name: wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text,
    name text DEFAULT 'My Wishlist'::text NOT NULL,
    share_token text DEFAULT encode(extensions.gen_random_bytes(32), 'base64'::text) NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: blog_comments blog_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: catalog_inquiries catalog_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_inquiries
    ADD CONSTRAINT catalog_inquiries_pkey PRIMARY KEY (id);


--
-- Name: custom_orders custom_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_orders
    ADD CONSTRAINT custom_orders_pkey PRIMARY KEY (id);


--
-- Name: diamond_price_history diamond_price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diamond_price_history
    ADD CONSTRAINT diamond_price_history_pkey PRIMARY KEY (id);


--
-- Name: diamond_prices diamond_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diamond_prices
    ADD CONSTRAINT diamond_prices_pkey PRIMARY KEY (id);


--
-- Name: guest_calculator_usage guest_calculator_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_calculator_usage
    ADD CONSTRAINT guest_calculator_usage_pkey PRIMARY KEY (id);


--
-- Name: invoice_templates invoice_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_templates
    ADD CONSTRAINT invoice_templates_pkey PRIMARY KEY (id);


--
-- Name: manufacturing_cost_estimates manufacturing_cost_estimates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manufacturing_cost_estimates
    ADD CONSTRAINT manufacturing_cost_estimates_pkey PRIMARY KEY (id);


--
-- Name: manufacturing_cost_estimates manufacturing_cost_estimates_share_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manufacturing_cost_estimates
    ADD CONSTRAINT manufacturing_cost_estimates_share_token_key UNIQUE (share_token);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_unsubscribe_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_unsubscribe_token_key UNIQUE (unsubscribe_token);


--
-- Name: permission_templates permission_templates_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission_templates
    ADD CONSTRAINT permission_templates_name_key UNIQUE (name);


--
-- Name: permission_templates permission_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission_templates
    ADD CONSTRAINT permission_templates_pkey PRIMARY KEY (id);


--
-- Name: points_history points_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points_history
    ADD CONSTRAINT points_history_pkey PRIMARY KEY (id);


--
-- Name: press_releases press_releases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.press_releases
    ADD CONSTRAINT press_releases_pkey PRIMARY KEY (id);


--
-- Name: product_interests product_interests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_interests
    ADD CONSTRAINT product_interests_pkey PRIMARY KEY (id);


--
-- Name: product_interests product_interests_product_id_share_link_id_customer_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_interests
    ADD CONSTRAINT product_interests_product_id_share_link_id_customer_email_key UNIQUE (product_id, share_link_id, customer_email);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: purchase_inquiries purchase_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_inquiries
    ADD CONSTRAINT purchase_inquiries_pkey PRIMARY KEY (id);


--
-- Name: redemptions redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemptions
    ADD CONSTRAINT redemptions_pkey PRIMARY KEY (id);


--
-- Name: rewards_catalog rewards_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards_catalog
    ADD CONSTRAINT rewards_catalog_pkey PRIMARY KEY (id);


--
-- Name: scratch_leads scratch_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scratch_leads
    ADD CONSTRAINT scratch_leads_pkey PRIMARY KEY (id);


--
-- Name: scratch_rewards scratch_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scratch_rewards
    ADD CONSTRAINT scratch_rewards_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: share_link_product_views share_link_product_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_link_product_views
    ADD CONSTRAINT share_link_product_views_pkey PRIMARY KEY (id);


--
-- Name: share_links share_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_links
    ADD CONSTRAINT share_links_pkey PRIMARY KEY (id);


--
-- Name: share_links share_links_share_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_links
    ADD CONSTRAINT share_links_share_token_key UNIQUE (share_token);


--
-- Name: user_approval_status user_approval_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_approval_status
    ADD CONSTRAINT user_approval_status_pkey PRIMARY KEY (id);


--
-- Name: user_approval_status user_approval_status_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_approval_status
    ADD CONSTRAINT user_approval_status_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: vendor_milestones vendor_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_milestones
    ADD CONSTRAINT vendor_milestones_pkey PRIMARY KEY (id);


--
-- Name: vendor_milestones vendor_milestones_user_id_milestone_type_milestone_value_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_milestones
    ADD CONSTRAINT vendor_milestones_user_id_milestone_type_milestone_value_key UNIQUE (user_id, milestone_type, milestone_value);


--
-- Name: vendor_permissions vendor_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_permissions
    ADD CONSTRAINT vendor_permissions_pkey PRIMARY KEY (id);


--
-- Name: vendor_permissions vendor_permissions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_permissions
    ADD CONSTRAINT vendor_permissions_user_id_key UNIQUE (user_id);


--
-- Name: vendor_points vendor_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_points
    ADD CONSTRAINT vendor_points_pkey PRIMARY KEY (id);


--
-- Name: vendor_profiles vendor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_profiles
    ADD CONSTRAINT vendor_profiles_pkey PRIMARY KEY (id);


--
-- Name: vendor_profiles vendor_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_profiles
    ADD CONSTRAINT vendor_profiles_user_id_key UNIQUE (user_id);


--
-- Name: video_requests video_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_requests
    ADD CONSTRAINT video_requests_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_wishlist_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_wishlist_id_product_id_key UNIQUE (wishlist_id, product_id);


--
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_share_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_share_token_key UNIQUE (share_token);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_entity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs USING btree (entity_type);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_catalog_inquiries_share_link_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_catalog_inquiries_share_link_id ON public.catalog_inquiries USING btree (share_link_id);


--
-- Name: idx_comments_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_created ON public.blog_comments USING btree (created_at DESC);


--
-- Name: idx_comments_post; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post ON public.blog_comments USING btree (blog_post_id);


--
-- Name: idx_comments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_status ON public.blog_comments USING btree (status);


--
-- Name: idx_diamond_price_history_changed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_diamond_price_history_changed_at ON public.diamond_price_history USING btree (changed_at DESC);


--
-- Name: idx_diamond_price_history_price_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_diamond_price_history_price_id ON public.diamond_price_history USING btree (price_id);


--
-- Name: idx_diamond_price_history_shape; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_diamond_price_history_shape ON public.diamond_price_history USING btree (shape);


--
-- Name: idx_diamond_prices_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_diamond_prices_lookup ON public.diamond_prices USING btree (shape, color_grade, clarity_grade, cut_grade, carat_range_min, carat_range_max);


--
-- Name: idx_guest_calculator_country_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_calculator_country_region ON public.guest_calculator_usage USING btree (country, region, calculator_type);


--
-- Name: idx_guest_calculator_usage_ip_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_calculator_usage_ip_date ON public.guest_calculator_usage USING btree (ip_address, calculator_type, used_at);


--
-- Name: idx_invoice_status_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_status_due_date ON public.manufacturing_cost_estimates USING btree (invoice_status, payment_due_date) WHERE (is_invoice_generated = true);


--
-- Name: idx_invoice_templates_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_templates_is_default ON public.invoice_templates USING btree (user_id, is_default) WHERE (is_default = true);


--
-- Name: idx_invoice_templates_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_templates_user_id ON public.invoice_templates USING btree (user_id);


--
-- Name: idx_manufacturing_cost_estimates_archived; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manufacturing_cost_estimates_archived ON public.manufacturing_cost_estimates USING btree (is_archived);


--
-- Name: idx_manufacturing_cost_estimates_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manufacturing_cost_estimates_created_at ON public.manufacturing_cost_estimates USING btree (created_at DESC);


--
-- Name: idx_manufacturing_cost_estimates_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manufacturing_cost_estimates_user_id ON public.manufacturing_cost_estimates USING btree (user_id);


--
-- Name: idx_manufacturing_estimates_customer_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manufacturing_estimates_customer_name ON public.manufacturing_cost_estimates USING btree (customer_name);


--
-- Name: idx_manufacturing_estimates_invoice_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manufacturing_estimates_invoice_number ON public.manufacturing_cost_estimates USING btree (invoice_number) WHERE (invoice_number IS NOT NULL);


--
-- Name: idx_manufacturing_estimates_share_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manufacturing_estimates_share_token ON public.manufacturing_cost_estimates USING btree (share_token);


--
-- Name: idx_manufacturing_estimates_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manufacturing_estimates_status ON public.manufacturing_cost_estimates USING btree (status);


--
-- Name: idx_manufacturing_estimates_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manufacturing_estimates_user_status ON public.manufacturing_cost_estimates USING btree (user_id, status);


--
-- Name: idx_newsletter_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers USING btree (is_active);


--
-- Name: idx_newsletter_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers USING btree (email);


--
-- Name: idx_points_history_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_points_history_created_at ON public.points_history USING btree (created_at DESC);


--
-- Name: idx_points_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_points_history_user_id ON public.points_history USING btree (user_id);


--
-- Name: idx_product_interests_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_interests_product_id ON public.product_interests USING btree (product_id);


--
-- Name: idx_product_interests_share_link_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_interests_share_link_id ON public.product_interests USING btree (share_link_id);


--
-- Name: idx_products_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_deleted_at ON public.products USING btree (deleted_at);


--
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- Name: idx_products_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_user_id ON public.products USING btree (user_id);


--
-- Name: idx_purchase_inquiries_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_inquiries_product ON public.purchase_inquiries USING btree (product_id);


--
-- Name: idx_purchase_inquiries_share_link; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_inquiries_share_link ON public.purchase_inquiries USING btree (share_link_id);


--
-- Name: idx_purchase_inquiries_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_inquiries_status ON public.purchase_inquiries USING btree (status);


--
-- Name: idx_scratch_leads_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scratch_leads_created ON public.scratch_leads USING btree (created_at);


--
-- Name: idx_scratch_leads_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scratch_leads_email ON public.scratch_leads USING btree (email);


--
-- Name: idx_scratch_leads_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scratch_leads_session ON public.scratch_leads USING btree (session_id);


--
-- Name: idx_scratch_rewards_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scratch_rewards_created ON public.scratch_rewards USING btree (created_at);


--
-- Name: idx_scratch_rewards_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scratch_rewards_session ON public.scratch_rewards USING btree (session_id);


--
-- Name: idx_share_link_product_views_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_share_link_product_views_product ON public.share_link_product_views USING btree (product_id);


--
-- Name: idx_share_link_product_views_share_link; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_share_link_product_views_share_link ON public.share_link_product_views USING btree (share_link_id);


--
-- Name: idx_share_link_product_views_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_share_link_product_views_viewed_at ON public.share_link_product_views USING btree (viewed_at DESC);


--
-- Name: idx_share_links_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_share_links_token ON public.share_links USING btree (share_token);


--
-- Name: idx_share_links_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_share_links_user_id ON public.share_links USING btree (user_id);


--
-- Name: idx_user_roles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_role ON public.user_roles USING btree (role);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: idx_user_sessions_last_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions USING btree (last_activity);


--
-- Name: idx_user_sessions_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_session_id ON public.user_sessions USING btree (session_id);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: idx_vendor_milestones_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_milestones_user_id ON public.vendor_milestones USING btree (user_id);


--
-- Name: idx_vendor_points_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_points_user_id ON public.vendor_points USING btree (user_id);


--
-- Name: idx_wishlist_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items USING btree (product_id);


--
-- Name: idx_wishlist_items_wishlist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlist_items_wishlist_id ON public.wishlist_items USING btree (wishlist_id);


--
-- Name: idx_wishlists_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlists_session_id ON public.wishlists USING btree (session_id);


--
-- Name: idx_wishlists_share_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlists_share_token ON public.wishlists USING btree (share_token);


--
-- Name: idx_wishlists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlists_user_id ON public.wishlists USING btree (user_id);


--
-- Name: products check_product_milestones; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER check_product_milestones AFTER INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.check_and_award_milestones();


--
-- Name: share_links check_share_link_milestones; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER check_share_link_milestones AFTER INSERT ON public.share_links FOR EACH ROW EXECUTE FUNCTION public.check_and_award_milestones();


--
-- Name: user_approval_status on_vendor_approved; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_vendor_approved AFTER INSERT OR UPDATE ON public.user_approval_status FOR EACH ROW EXECUTE FUNCTION public.create_default_vendor_permissions();


--
-- Name: products set_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: blog_posts update_blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: brands update_brands_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: diamond_prices update_diamond_prices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_diamond_prices_updated_at BEFORE UPDATE ON public.diamond_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoice_templates update_invoice_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON public.invoice_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: manufacturing_cost_estimates update_manufacturing_cost_estimates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_manufacturing_cost_estimates_updated_at BEFORE UPDATE ON public.manufacturing_cost_estimates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: permission_templates update_permission_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_permission_templates_updated_at BEFORE UPDATE ON public.permission_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vendor_permissions update_permissions_on_plan_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_permissions_on_plan_change BEFORE INSERT OR UPDATE OF subscription_plan ON public.vendor_permissions FOR EACH ROW EXECUTE FUNCTION public.update_permissions_for_plan();


--
-- Name: press_releases update_press_releases_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_press_releases_updated_at BEFORE UPDATE ON public.press_releases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: rewards_catalog update_rewards_catalog_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_rewards_catalog_updated_at BEFORE UPDATE ON public.rewards_catalog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: settings update_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vendor_permissions update_vendor_permissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vendor_permissions_updated_at BEFORE UPDATE ON public.vendor_permissions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: vendor_points update_vendor_points_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vendor_points_updated_at BEFORE UPDATE ON public.vendor_points FOR EACH ROW EXECUTE FUNCTION public.update_vendor_points_updated_at();


--
-- Name: vendor_profiles update_vendor_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON public.vendor_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_vendor_profile_updated_at();


--
-- Name: video_requests update_video_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_video_requests_updated_at BEFORE UPDATE ON public.video_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: wishlists update_wishlists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON public.wishlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: share_links validate_expiration_before_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER validate_expiration_before_insert BEFORE INSERT ON public.share_links FOR EACH ROW EXECUTE FUNCTION public.validate_share_link_expiration();


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: blog_comments blog_comments_blog_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_blog_post_id_fkey FOREIGN KEY (blog_post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_comments blog_comments_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES auth.users(id);


--
-- Name: blog_posts blog_posts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: catalog_inquiries catalog_inquiries_share_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.catalog_inquiries
    ADD CONSTRAINT catalog_inquiries_share_link_id_fkey FOREIGN KEY (share_link_id) REFERENCES public.share_links(id) ON DELETE CASCADE;


--
-- Name: custom_orders custom_orders_share_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_orders
    ADD CONSTRAINT custom_orders_share_link_id_fkey FOREIGN KEY (share_link_id) REFERENCES public.share_links(id);


--
-- Name: diamond_price_history diamond_price_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diamond_price_history
    ADD CONSTRAINT diamond_price_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);


--
-- Name: permission_templates permission_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission_templates
    ADD CONSTRAINT permission_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: points_history points_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points_history
    ADD CONSTRAINT points_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: product_interests product_interests_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_interests
    ADD CONSTRAINT product_interests_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_interests product_interests_share_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_interests
    ADD CONSTRAINT product_interests_share_link_id_fkey FOREIGN KEY (share_link_id) REFERENCES public.share_links(id) ON DELETE CASCADE;


--
-- Name: products products_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: purchase_inquiries purchase_inquiries_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_inquiries
    ADD CONSTRAINT purchase_inquiries_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: purchase_inquiries purchase_inquiries_share_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_inquiries
    ADD CONSTRAINT purchase_inquiries_share_link_id_fkey FOREIGN KEY (share_link_id) REFERENCES public.share_links(id) ON DELETE CASCADE;


--
-- Name: redemptions redemptions_reward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemptions
    ADD CONSTRAINT redemptions_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES public.rewards_catalog(id);


--
-- Name: settings settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: share_link_product_views share_link_product_views_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_link_product_views
    ADD CONSTRAINT share_link_product_views_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: share_link_product_views share_link_product_views_share_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_link_product_views
    ADD CONSTRAINT share_link_product_views_share_link_id_fkey FOREIGN KEY (share_link_id) REFERENCES public.share_links(id) ON DELETE CASCADE;


--
-- Name: share_links share_links_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_links
    ADD CONSTRAINT share_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: vendor_milestones vendor_milestones_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_milestones
    ADD CONSTRAINT vendor_milestones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: vendor_permissions vendor_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_permissions
    ADD CONSTRAINT vendor_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: vendor_points vendor_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_points
    ADD CONSTRAINT vendor_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: vendor_profiles vendor_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_profiles
    ADD CONSTRAINT vendor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: video_requests video_requests_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_requests
    ADD CONSTRAINT video_requests_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: video_requests video_requests_share_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_requests
    ADD CONSTRAINT video_requests_share_link_id_fkey FOREIGN KEY (share_link_id) REFERENCES public.share_links(id);


--
-- Name: wishlist_items wishlist_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_share_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_share_link_id_fkey FOREIGN KEY (share_link_id) REFERENCES public.share_links(id) ON DELETE SET NULL;


--
-- Name: wishlist_items wishlist_items_wishlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_wishlist_id_fkey FOREIGN KEY (wishlist_id) REFERENCES public.wishlists(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: share_links Admins and team members can create share links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and team members can create share links" ON public.share_links FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'team_member'::public.app_role))));


--
-- Name: user_sessions Admins and team members can view all sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and team members can view all sessions" ON public.user_sessions FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'team_member'::public.app_role)));


--
-- Name: blog_posts Admins can delete blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete blog posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: brands Admins can delete brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete brands" ON public.brands FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_comments Admins can delete comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete comments" ON public.blog_comments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: diamond_prices Admins can delete diamond prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete diamond prices" ON public.diamond_prices FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: permission_templates Admins can delete permission templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete permission templates" ON public.permission_templates FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: press_releases Admins can delete press releases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete press releases" ON public.press_releases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: rewards_catalog Admins can delete rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete rewards" ON public.rewards_catalog FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: settings Admins can delete settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete settings" ON public.settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins can delete subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: audit_logs Admins can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_posts Admins can insert blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert blog posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: brands Admins can insert brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert brands" ON public.brands FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: diamond_prices Admins can insert diamond prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert diamond prices" ON public.diamond_prices FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: permission_templates Admins can insert permission templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert permission templates" ON public.permission_templates FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: vendor_permissions Admins can insert permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert permissions" ON public.vendor_permissions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: press_releases Admins can insert press releases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert press releases" ON public.press_releases FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: rewards_catalog Admins can insert rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert rewards" ON public.rewards_catalog FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: settings Admins can insert settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_approval_status Admins can update approval statuses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update approval statuses" ON public.user_approval_status FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_posts Admins can update blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update blog posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: brands Admins can update brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update brands" ON public.brands FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_comments Admins can update comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update comments" ON public.blog_comments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: custom_orders Admins can update custom orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update custom orders" ON public.custom_orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: diamond_prices Admins can update diamond prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update diamond prices" ON public.diamond_prices FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: permission_templates Admins can update permission templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update permission templates" ON public.permission_templates FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: vendor_permissions Admins can update permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update permissions" ON public.vendor_permissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: press_releases Admins can update press releases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update press releases" ON public.press_releases FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: redemptions Admins can update redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update redemptions" ON public.redemptions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: rewards_catalog Admins can update rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update rewards" ON public.rewards_catalog FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: settings Admins can update settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins can update subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update subscribers" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: video_requests Admins can update video requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update video requests" ON public.video_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_approval_status Admins can view all approval statuses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all approval statuses" ON public.user_approval_status FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: audit_logs Admins can view all audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: guest_calculator_usage Admins can view all calculator usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all calculator usage" ON public.guest_calculator_usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: custom_orders Admins can view all custom orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all custom orders" ON public.custom_orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: scratch_leads Admins can view all leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all leads" ON public.scratch_leads FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: manufacturing_cost_estimates Admins can view all manufacturing estimates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all manufacturing estimates" ON public.manufacturing_cost_estimates FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: vendor_milestones Admins can view all milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all milestones" ON public.vendor_milestones FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: permission_templates Admins can view all permission templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all permission templates" ON public.permission_templates FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: vendor_permissions Admins can view all permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all permissions" ON public.vendor_permissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: vendor_points Admins can view all points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all points" ON public.vendor_points FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: points_history Admins can view all points history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all points history" ON public.points_history FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: diamond_price_history Admins can view all price history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all price history" ON public.diamond_price_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: share_link_product_views Admins can view all product views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all product views" ON public.share_link_product_views FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: redemptions Admins can view all redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all redemptions" ON public.redemptions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins can view all subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoice_templates Admins can view all templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all templates" ON public.invoice_templates FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: manufacturing_cost_estimates Allow public read access with valid share token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access with valid share token" ON public.manufacturing_cost_estimates FOR SELECT USING (((is_customer_visible = true) AND (share_token IS NOT NULL)));


--
-- Name: scratch_rewards Anyone can create scratch attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create scratch attempts" ON public.scratch_rewards FOR INSERT WITH CHECK (true);


--
-- Name: catalog_inquiries Anyone can insert inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert inquiries" ON public.catalog_inquiries FOR INSERT WITH CHECK (true);


--
-- Name: product_interests Anyone can insert interests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert interests" ON public.product_interests FOR INSERT WITH CHECK (true);


--
-- Name: user_approval_status Anyone can insert their own approval status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert their own approval status" ON public.user_approval_status FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: blog_comments Anyone can submit comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit comments" ON public.blog_comments FOR INSERT WITH CHECK (true);


--
-- Name: custom_orders Anyone can submit custom orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit custom orders" ON public.custom_orders FOR INSERT WITH CHECK (true);


--
-- Name: scratch_leads Anyone can submit leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit leads" ON public.scratch_leads FOR INSERT WITH CHECK (true);


--
-- Name: purchase_inquiries Anyone can submit purchase inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit purchase inquiries" ON public.purchase_inquiries FOR INSERT WITH CHECK (true);


--
-- Name: video_requests Anyone can submit video requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit video requests" ON public.video_requests FOR INSERT WITH CHECK (true);


--
-- Name: newsletter_subscribers Anyone can subscribe; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);


--
-- Name: guest_calculator_usage Anyone can track calculator usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can track calculator usage" ON public.guest_calculator_usage FOR INSERT TO anon WITH CHECK (true);


--
-- Name: share_link_product_views Anyone can track product views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can track product views" ON public.share_link_product_views FOR INSERT WITH CHECK (true);


--
-- Name: brands Anyone can view active brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active brands" ON public.brands FOR SELECT USING (((active = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: rewards_catalog Anyone can view active rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active rewards" ON public.rewards_catalog FOR SELECT USING (((is_active = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: blog_comments Anyone can view approved comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved comments" ON public.blog_comments FOR SELECT USING (((status = 'approved'::text) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: diamond_prices Anyone can view diamond prices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view diamond prices" ON public.diamond_prices FOR SELECT USING (true);


--
-- Name: press_releases Anyone can view press releases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view press releases" ON public.press_releases FOR SELECT USING (true);


--
-- Name: wishlists Anyone can view public wishlists by share token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public wishlists by share token" ON public.wishlists FOR SELECT USING ((is_public = true));


--
-- Name: blog_posts Anyone can view published blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (((published = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: settings Anyone can view settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);


--
-- Name: catalog_inquiries Only admins can delete inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete inquiries" ON public.catalog_inquiries FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: product_interests Only admins can delete interests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete interests" ON public.product_interests FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: catalog_inquiries Only admins can update inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update inquiries" ON public.catalog_inquiries FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: product_interests Only admins can update interests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update interests" ON public.product_interests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: catalog_inquiries Only share link owners can view inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only share link owners can view inquiries" ON public.catalog_inquiries FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.share_links
  WHERE ((share_links.id = catalog_inquiries.share_link_id) AND (share_links.user_id = auth.uid())))));


--
-- Name: product_interests Only share link owners can view interests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only share link owners can view interests" ON public.product_interests FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.share_links
  WHERE ((share_links.id = product_interests.share_link_id) AND (share_links.user_id = auth.uid())))));


--
-- Name: vendor_milestones Service role can insert milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert milestones" ON public.vendor_milestones FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: points_history Service role can insert points history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert points history" ON public.points_history FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: redemptions Service role can insert redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert redemptions" ON public.redemptions FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: user_sessions Service role can manage all sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage all sessions" ON public.user_sessions USING ((auth.role() = 'service_role'::text));


--
-- Name: share_link_product_views Share link owners can view product views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Share link owners can view product views" ON public.share_link_product_views FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.share_links
  WHERE ((share_links.id = share_link_product_views.share_link_id) AND (share_links.user_id = auth.uid())))));


--
-- Name: custom_orders Share link owners can view their custom orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Share link owners can view their custom orders" ON public.custom_orders FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.share_links
  WHERE ((share_links.id = custom_orders.share_link_id) AND (share_links.user_id = auth.uid())))));


--
-- Name: video_requests Share link owners can view video requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Share link owners can view video requests" ON public.video_requests FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.share_links
  WHERE ((share_links.id = video_requests.share_link_id) AND (share_links.user_id = auth.uid())))));


--
-- Name: diamond_price_history System can insert price history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert price history" ON public.diamond_price_history FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: vendor_profiles Users and team members can view vendor profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users and team members can view vendor profiles" ON public.vendor_profiles FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'team_member'::public.app_role)));


--
-- Name: wishlist_items Users can add items to their wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add items to their wishlists" ON public.wishlist_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.wishlists
  WHERE ((wishlists.id = wishlist_items.wishlist_id) AND (((auth.uid() IS NOT NULL) AND (auth.uid() = wishlists.user_id)) OR ((auth.uid() IS NULL) AND (wishlists.session_id IS NOT NULL)))))));


--
-- Name: invoice_templates Users can create their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own templates" ON public.invoice_templates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: wishlists Users can create their own wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own wishlists" ON public.wishlists FOR INSERT WITH CHECK ((((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) OR ((auth.uid() IS NULL) AND (session_id IS NOT NULL))));


--
-- Name: manufacturing_cost_estimates Users can delete their own estimates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own estimates" ON public.manufacturing_cost_estimates FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: products Users can delete their own products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_sessions Users can delete their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own sessions" ON public.user_sessions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: share_links Users can delete their own share links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own share links" ON public.share_links FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: invoice_templates Users can delete their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own templates" ON public.invoice_templates FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: wishlists Users can delete their own wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own wishlists" ON public.wishlists FOR DELETE USING ((((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) OR ((auth.uid() IS NULL) AND (session_id IS NOT NULL))));


--
-- Name: manufacturing_cost_estimates Users can insert their own estimates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own estimates" ON public.manufacturing_cost_estimates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: vendor_points Users can insert their own points record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own points record" ON public.vendor_points FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: products Users can insert their own products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own products" ON public.products FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: vendor_profiles Users can insert their own vendor profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own vendor profile" ON public.vendor_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: wishlist_items Users can remove items from their wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove items from their wishlists" ON public.wishlist_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.wishlists
  WHERE ((wishlists.id = wishlist_items.wishlist_id) AND (((auth.uid() IS NOT NULL) AND (auth.uid() = wishlists.user_id)) OR ((auth.uid() IS NULL) AND (wishlists.session_id IS NOT NULL)))))));


--
-- Name: manufacturing_cost_estimates Users can update their own estimates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own estimates" ON public.manufacturing_cost_estimates FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: vendor_points Users can update their own points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own points" ON public.vendor_points FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: products Users can update their own products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: scratch_rewards Users can update their own scratch rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own scratch rewards" ON public.scratch_rewards FOR UPDATE USING ((session_id = public.get_scratch_session_id()));


--
-- Name: share_links Users can update their own share links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own share links" ON public.share_links FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: invoice_templates Users can update their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own templates" ON public.invoice_templates FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: vendor_profiles Users can update their own vendor profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own vendor profile" ON public.vendor_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: wishlists Users can update their own wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own wishlists" ON public.wishlists FOR UPDATE USING ((((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) OR ((auth.uid() IS NULL) AND (session_id IS NOT NULL))));


--
-- Name: wishlist_items Users can view items in their wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view items in their wishlists" ON public.wishlist_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.wishlists
  WHERE ((wishlists.id = wishlist_items.wishlist_id) AND (((auth.uid() IS NOT NULL) AND (auth.uid() = wishlists.user_id)) OR ((auth.uid() IS NULL) AND (wishlists.session_id IS NOT NULL)) OR (wishlists.is_public = true))))));


--
-- Name: user_approval_status Users can view their own approval status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own approval status" ON public.user_approval_status FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: manufacturing_cost_estimates Users can view their own estimates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own estimates" ON public.manufacturing_cost_estimates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: vendor_milestones Users can view their own milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own milestones" ON public.vendor_milestones FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: vendor_permissions Users can view their own permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own permissions" ON public.vendor_permissions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: vendor_points Users can view their own points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own points" ON public.vendor_points FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: points_history Users can view their own points history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own points history" ON public.points_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: products Users can view their own products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own products" ON public.products FOR SELECT USING ((((auth.uid() = user_id) AND ((deleted_at IS NULL) OR (abs(EXTRACT(epoch FROM (statement_timestamp() - deleted_at))) < (1)::numeric))) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: redemptions Users can view their own redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own redemptions" ON public.redemptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: scratch_rewards Users can view their own scratch rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own scratch rewards" ON public.scratch_rewards FOR SELECT USING ((session_id = public.get_scratch_session_id()));


--
-- Name: user_sessions Users can view their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: share_links Users can view their own share links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own share links" ON public.share_links FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: invoice_templates Users can view their own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own templates" ON public.invoice_templates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: wishlists Users can view their own wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own wishlists" ON public.wishlists FOR SELECT USING ((((auth.uid() IS NOT NULL) AND (auth.uid() = user_id)) OR ((auth.uid() IS NULL) AND (session_id IS NOT NULL))));


--
-- Name: purchase_inquiries Vendors can update their purchase inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Vendors can update their purchase inquiries" ON public.purchase_inquiries FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.share_links
  WHERE ((share_links.id = purchase_inquiries.share_link_id) AND (share_links.user_id = auth.uid())))));


--
-- Name: purchase_inquiries Vendors can view their purchase inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Vendors can view their purchase inquiries" ON public.purchase_inquiries FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.share_links
  WHERE ((share_links.id = purchase_inquiries.share_link_id) AND (share_links.user_id = auth.uid())))));


--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: brands; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

--
-- Name: catalog_inquiries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.catalog_inquiries ENABLE ROW LEVEL SECURITY;

--
-- Name: custom_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: diamond_price_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.diamond_price_history ENABLE ROW LEVEL SECURITY;

--
-- Name: diamond_prices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.diamond_prices ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_calculator_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guest_calculator_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: manufacturing_cost_estimates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.manufacturing_cost_estimates ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: permission_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.permission_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: points_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

--
-- Name: press_releases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.press_releases ENABLE ROW LEVEL SECURITY;

--
-- Name: product_interests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_interests ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: purchase_inquiries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.purchase_inquiries ENABLE ROW LEVEL SECURITY;

--
-- Name: redemptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

--
-- Name: rewards_catalog; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;

--
-- Name: scratch_leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scratch_leads ENABLE ROW LEVEL SECURITY;

--
-- Name: scratch_rewards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scratch_rewards ENABLE ROW LEVEL SECURITY;

--
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- Name: share_link_product_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.share_link_product_views ENABLE ROW LEVEL SECURITY;

--
-- Name: share_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

--
-- Name: user_approval_status; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_approval_status ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: vendor_milestones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vendor_milestones ENABLE ROW LEVEL SECURITY;

--
-- Name: vendor_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vendor_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: vendor_points; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vendor_points ENABLE ROW LEVEL SECURITY;

--
-- Name: vendor_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: video_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.video_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: wishlist_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

--
-- Name: wishlists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


