-- Add expiration tracking to points_history
ALTER TABLE public.points_history
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expired BOOLEAN DEFAULT false;

-- Set expiration date for existing points (90 days from creation)
UPDATE public.points_history
SET expires_at = created_at + INTERVAL '90 days'
WHERE expires_at IS NULL AND points > 0;

-- Function to calculate non-expired points
CREATE OR REPLACE FUNCTION public.get_active_points(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Function to get expiring soon points (within 30 days)
CREATE OR REPLACE FUNCTION public.get_expiring_points(user_id_param UUID)
RETURNS TABLE(points INTEGER, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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