-- Add estimate_category column to manufacturing_cost_estimates table
ALTER TABLE public.manufacturing_cost_estimates 
ADD COLUMN estimate_category text DEFAULT 'jewelry' 
CHECK (estimate_category IN ('jewelry', 'loose_diamond', 'gemstone'));