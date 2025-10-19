-- Fix search_path for security functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_share_link_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Expiration date must be in the future';
  END IF;
  RETURN NEW;
END;
$$;