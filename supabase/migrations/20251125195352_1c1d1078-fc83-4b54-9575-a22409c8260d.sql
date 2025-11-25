-- Create rewards catalog table
CREATE TABLE IF NOT EXISTS public.rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'extra_products', 'extra_share_links', 'premium_support', 'custom'
  reward_value JSONB NOT NULL, -- flexible structure for different reward types
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create redemptions table
CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards_catalog(id),
  points_spent INTEGER NOT NULL,
  reward_details JSONB,
  status TEXT DEFAULT 'pending', -- 'pending', 'applied', 'expired'
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rewards_catalog
CREATE POLICY "Anyone can view active rewards"
  ON public.rewards_catalog FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert rewards"
  ON public.rewards_catalog FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update rewards"
  ON public.rewards_catalog FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete rewards"
  ON public.rewards_catalog FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for redemptions
CREATE POLICY "Users can view their own redemptions"
  ON public.redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
  ON public.redemptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert redemptions"
  ON public.redemptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update redemptions"
  ON public.redemptions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger for rewards_catalog
CREATE TRIGGER update_rewards_catalog_updated_at
  BEFORE UPDATE ON public.rewards_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rewards
INSERT INTO public.rewards_catalog (name, description, points_cost, reward_type, reward_value) VALUES
  ('10 Extra Products', 'Add 10 more products to your catalog limit', 100, 'extra_products', '{"amount": 10}'::jsonb),
  ('25 Extra Products', 'Add 25 more products to your catalog limit', 200, 'extra_products', '{"amount": 25}'::jsonb),
  ('50 Extra Products', 'Add 50 more products to your catalog limit', 350, 'extra_products', '{"amount": 50}'::jsonb),
  ('Extra Share Link', 'Create one additional share link', 150, 'extra_share_links', '{"amount": 1}'::jsonb),
  ('3 Extra Share Links', 'Create three additional share links', 400, 'extra_share_links', '{"amount": 3}'::jsonb),
  ('Premium Support (1 Month)', 'Get priority email and chat support for 30 days', 500, 'premium_support', '{"duration_days": 30}'::jsonb),
  ('Premium Support (3 Months)', 'Get priority email and chat support for 90 days', 1200, 'premium_support', '{"duration_days": 90}'::jsonb);