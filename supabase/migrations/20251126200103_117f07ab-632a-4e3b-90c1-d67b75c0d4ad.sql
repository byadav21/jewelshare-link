-- Add customer details columns to manufacturing_cost_estimates table
ALTER TABLE public.manufacturing_cost_estimates
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT;