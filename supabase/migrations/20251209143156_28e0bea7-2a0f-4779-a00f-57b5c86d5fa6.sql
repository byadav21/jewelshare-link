-- Add archived_at timestamp to track when estimates were archived
ALTER TABLE public.manufacturing_cost_estimates
ADD COLUMN archived_at timestamp with time zone;