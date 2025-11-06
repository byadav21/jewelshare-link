-- Add delivery information columns to products table
ALTER TABLE public.products
ADD COLUMN delivery_type text DEFAULT 'immediate' CHECK (delivery_type IN ('immediate', 'scheduled')),
ADD COLUMN delivery_date timestamp with time zone;