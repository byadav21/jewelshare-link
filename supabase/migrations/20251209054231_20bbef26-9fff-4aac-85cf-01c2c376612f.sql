-- Drop existing overly permissive INSERT policies
DROP POLICY IF EXISTS "System can insert milestones" ON public.vendor_milestones;
DROP POLICY IF EXISTS "System can insert redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "System can insert points history" ON public.points_history;

-- Create restricted INSERT policies that only allow service_role
CREATE POLICY "Service role can insert milestones"
ON public.vendor_milestones
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert redemptions"
ON public.redemptions
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert points history"
ON public.points_history
FOR INSERT
WITH CHECK (auth.role() = 'service_role');