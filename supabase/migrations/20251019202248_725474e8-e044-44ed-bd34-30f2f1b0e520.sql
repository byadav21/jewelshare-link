-- Create approval status enum
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create user_approval_status table
CREATE TABLE public.user_approval_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  status approval_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  rejection_reason TEXT,
  business_name TEXT,
  phone TEXT,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.user_approval_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own approval status"
  ON public.user_approval_status
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all approval statuses"
  ON public.user_approval_status
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update approval statuses"
  ON public.user_approval_status
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert their own approval status"
  ON public.user_approval_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Security definer function to check approval status
CREATE OR REPLACE FUNCTION public.is_user_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_approval_status
    WHERE user_id = _user_id
      AND status = 'approved'
  )
$$;

-- Trigger function to auto-create approval entry on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_approval_status (user_id, status)
  VALUES (NEW.id, 'pending');
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created_approval
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_approval();