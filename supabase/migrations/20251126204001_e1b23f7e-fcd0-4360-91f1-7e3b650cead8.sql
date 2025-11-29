-- Add admin policy to view all manufacturing cost estimates
CREATE POLICY "Admins can view all manufacturing estimates"
ON public.manufacturing_cost_estimates
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));