-- Create manufacturing_cost_estimates table to store saved estimates
CREATE TABLE public.manufacturing_cost_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  estimate_name TEXT NOT NULL,
  net_weight DECIMAL(10, 3),
  purity_fraction DECIMAL(5, 3),
  gold_rate_24k DECIMAL(12, 2),
  making_charges DECIMAL(12, 2),
  cad_design_charges DECIMAL(12, 2),
  camming_charges DECIMAL(12, 2),
  certification_cost DECIMAL(12, 2),
  diamond_cost DECIMAL(12, 2),
  gemstone_cost DECIMAL(12, 2),
  gold_cost DECIMAL(12, 2),
  total_cost DECIMAL(12, 2),
  profit_margin_percentage DECIMAL(5, 2),
  final_selling_price DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.manufacturing_cost_estimates ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only view/manage their own estimates
CREATE POLICY "Users can view their own estimates"
  ON public.manufacturing_cost_estimates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own estimates"
  ON public.manufacturing_cost_estimates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimates"
  ON public.manufacturing_cost_estimates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimates"
  ON public.manufacturing_cost_estimates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_manufacturing_cost_estimates_updated_at
  BEFORE UPDATE ON public.manufacturing_cost_estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_manufacturing_cost_estimates_user_id 
  ON public.manufacturing_cost_estimates(user_id);

CREATE INDEX idx_manufacturing_cost_estimates_created_at 
  ON public.manufacturing_cost_estimates(created_at DESC);