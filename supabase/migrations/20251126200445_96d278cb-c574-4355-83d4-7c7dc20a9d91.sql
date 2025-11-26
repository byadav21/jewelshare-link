-- Add status column to manufacturing_cost_estimates table
ALTER TABLE public.manufacturing_cost_estimates
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'quoted', 'approved', 'in_production', 'completed', 'cancelled'));

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_manufacturing_estimates_status ON public.manufacturing_cost_estimates(status);

-- Create index for customer name queries
CREATE INDEX IF NOT EXISTS idx_manufacturing_estimates_customer_name ON public.manufacturing_cost_estimates(customer_name);

-- Create index for user_id and status combination
CREATE INDEX IF NOT EXISTS idx_manufacturing_estimates_user_status ON public.manufacturing_cost_estimates(user_id, status);