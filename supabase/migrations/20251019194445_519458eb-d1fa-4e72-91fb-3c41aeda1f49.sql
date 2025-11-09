-- Create custom orders table
CREATE TABLE public.custom_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  metal_type TEXT,
  gemstone_preference TEXT,
  design_description TEXT NOT NULL,
  budget_range TEXT,
  reference_images TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert custom orders (public form)
CREATE POLICY "Anyone can submit custom orders"
ON public.custom_orders
FOR INSERT
WITH CHECK (true);

-- Policy: Only admins can view custom orders
CREATE POLICY "Admins can view all custom orders"
ON public.custom_orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can update custom orders
CREATE POLICY "Admins can update custom orders"
ON public.custom_orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));