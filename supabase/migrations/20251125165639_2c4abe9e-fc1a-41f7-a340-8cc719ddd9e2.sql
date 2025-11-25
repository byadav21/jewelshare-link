-- Create leads table for scratch card registration
CREATE TABLE IF NOT EXISTS public.scratch_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  interest TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scratch_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert leads
CREATE POLICY "Anyone can submit leads"
  ON public.scratch_leads
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
  ON public.scratch_leads
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_scratch_leads_session ON public.scratch_leads(session_id);
CREATE INDEX idx_scratch_leads_email ON public.scratch_leads(email);
CREATE INDEX idx_scratch_leads_created ON public.scratch_leads(created_at);