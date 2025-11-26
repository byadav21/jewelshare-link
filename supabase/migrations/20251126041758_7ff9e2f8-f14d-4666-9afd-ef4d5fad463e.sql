-- Create diamond prices table for Rapaport-style pricing
CREATE TABLE public.diamond_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shape TEXT NOT NULL,
  carat_range_min NUMERIC NOT NULL,
  carat_range_max NUMERIC NOT NULL,
  color_grade TEXT NOT NULL,
  clarity_grade TEXT NOT NULL,
  cut_grade TEXT NOT NULL,
  price_per_carat NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.diamond_prices ENABLE ROW LEVEL SECURITY;

-- Anyone can view prices
CREATE POLICY "Anyone can view diamond prices"
ON public.diamond_prices
FOR SELECT
USING (true);

-- Only admins can manage prices
CREATE POLICY "Admins can insert diamond prices"
ON public.diamond_prices
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update diamond prices"
ON public.diamond_prices
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete diamond prices"
ON public.diamond_prices
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for faster lookups
CREATE INDEX idx_diamond_prices_lookup ON public.diamond_prices(shape, color_grade, clarity_grade, cut_grade, carat_range_min, carat_range_max);

-- Add trigger for updated_at
CREATE TRIGGER update_diamond_prices_updated_at
BEFORE UPDATE ON public.diamond_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();