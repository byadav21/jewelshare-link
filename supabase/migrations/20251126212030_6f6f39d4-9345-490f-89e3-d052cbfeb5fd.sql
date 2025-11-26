-- Create table to track guest calculator usage by IP
CREATE TABLE IF NOT EXISTS public.guest_calculator_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  calculator_type TEXT NOT NULL, -- 'manufacturing' or 'diamond'
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_agent TEXT
);

-- Create index for efficient IP lookups
CREATE INDEX IF NOT EXISTS idx_guest_calculator_usage_ip_date 
ON public.guest_calculator_usage(ip_address, calculator_type, used_at);

-- Enable RLS
ALTER TABLE public.guest_calculator_usage ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert (needed for guest tracking)
CREATE POLICY "Anyone can track calculator usage"
ON public.guest_calculator_usage
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy for admins to view all usage
CREATE POLICY "Admins can view all calculator usage"
ON public.guest_calculator_usage
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));