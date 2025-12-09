-- Add is_archived column to manufacturing_cost_estimates
ALTER TABLE public.manufacturing_cost_estimates
ADD COLUMN is_archived boolean DEFAULT false;

-- Create index for efficient filtering
CREATE INDEX idx_manufacturing_cost_estimates_archived ON public.manufacturing_cost_estimates(is_archived);