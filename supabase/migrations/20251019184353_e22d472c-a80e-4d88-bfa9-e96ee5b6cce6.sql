-- Add diamond_weight and net_weight columns to products table
ALTER TABLE public.products 
ADD COLUMN diamond_weight numeric,
ADD COLUMN net_weight numeric;