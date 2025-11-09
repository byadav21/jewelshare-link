-- Add email to user_approval_status for easier lookups
ALTER TABLE public.user_approval_status 
ADD COLUMN IF NOT EXISTS email TEXT;