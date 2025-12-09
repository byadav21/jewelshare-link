-- Fix scratch_rewards RLS policies to validate session_id
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view their own scratch rewards" ON public.scratch_rewards;
DROP POLICY IF EXISTS "Users can update their own scratch rewards" ON public.scratch_rewards;

-- Create a function to get session_id from request headers
CREATE OR REPLACE FUNCTION public.get_scratch_session_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.headers', true)::json->>'x-scratch-session-id',
    ''
  )
$$;

-- Create new SELECT policy that validates session_id from header
CREATE POLICY "Users can view their own scratch rewards"
  ON public.scratch_rewards
  FOR SELECT
  USING (session_id = public.get_scratch_session_id());

-- Create new UPDATE policy that validates session_id from header  
CREATE POLICY "Users can update their own scratch rewards"
  ON public.scratch_rewards
  FOR UPDATE
  USING (session_id = public.get_scratch_session_id());