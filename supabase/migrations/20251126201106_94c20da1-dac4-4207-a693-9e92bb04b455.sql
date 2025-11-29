-- Add customer portal fields to manufacturing_cost_estimates
ALTER TABLE public.manufacturing_cost_estimates
ADD COLUMN share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
ADD COLUMN estimated_completion_date TIMESTAMPTZ,
ADD COLUMN is_customer_visible BOOLEAN DEFAULT false;

-- Create index for faster token lookups
CREATE INDEX idx_manufacturing_estimates_share_token ON public.manufacturing_cost_estimates(share_token);

-- Enable RLS for public customer portal access
CREATE POLICY "Allow public read access with valid share token"
ON public.manufacturing_cost_estimates
FOR SELECT
USING (
  is_customer_visible = true 
  AND share_token IS NOT NULL
);

-- Enable realtime for customer portal
ALTER PUBLICATION supabase_realtime ADD TABLE public.manufacturing_cost_estimates;