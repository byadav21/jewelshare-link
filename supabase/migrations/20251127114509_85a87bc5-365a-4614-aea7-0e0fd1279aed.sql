
-- Add line_items column to manufacturing_cost_estimates to support multiple jewelry items per invoice
ALTER TABLE public.manufacturing_cost_estimates
ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.manufacturing_cost_estimates.line_items IS 'Array of line items, each containing: item_name, description, image_url, diamond_weight, gemstone_weight, net_weight, gross_weight, diamond_cost, gemstone_cost, gold_cost, making_charges, certification_cost, cad_design_charges, camming_charges, subtotal';
