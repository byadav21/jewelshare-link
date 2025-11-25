-- Create vendor points table to track user rewards
CREATE TABLE public.vendor_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_tier TEXT NOT NULL DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create points history table to track all point transactions
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milestones table to track achievements
CREATE TABLE public.vendor_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  milestone_value INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, milestone_type, milestone_value)
);

-- Enable RLS on all tables
ALTER TABLE public.vendor_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_points
CREATE POLICY "Users can view their own points"
  ON public.vendor_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points record"
  ON public.vendor_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON public.vendor_points FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all points"
  ON public.vendor_points FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for points_history
CREATE POLICY "Users can view their own points history"
  ON public.points_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert points history"
  ON public.points_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all points history"
  ON public.points_history FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for vendor_milestones
CREATE POLICY "Users can view their own milestones"
  ON public.vendor_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert milestones"
  ON public.vendor_milestones FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all milestones"
  ON public.vendor_milestones FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_vendor_points_user_id ON public.vendor_points(user_id);
CREATE INDEX idx_points_history_user_id ON public.points_history(user_id);
CREATE INDEX idx_points_history_created_at ON public.points_history(created_at DESC);
CREATE INDEX idx_vendor_milestones_user_id ON public.vendor_milestones(user_id);

-- Create function to update vendor_points updated_at
CREATE OR REPLACE FUNCTION public.update_vendor_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for vendor_points updated_at
CREATE TRIGGER update_vendor_points_updated_at
  BEFORE UPDATE ON public.vendor_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vendor_points_updated_at();

-- Create function to check and award milestones
CREATE OR REPLACE FUNCTION public.check_and_award_milestones()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_product_count INTEGER;
  v_share_link_count INTEGER;
  v_total_views INTEGER;
BEGIN
  v_user_id := NEW.user_id;
  
  -- Check product milestones
  IF TG_TABLE_NAME = 'products' THEN
    SELECT COUNT(*) INTO v_product_count
    FROM public.products
    WHERE user_id = v_user_id AND deleted_at IS NULL;
    
    -- Award milestone points for product counts
    IF v_product_count = 10 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'products_added', 10, 50)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    ELSIF v_product_count = 50 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'products_added', 50, 200)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    ELSIF v_product_count = 100 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'products_added', 100, 500)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    END IF;
  END IF;
  
  -- Check share link milestones
  IF TG_TABLE_NAME = 'share_links' THEN
    SELECT COUNT(*) INTO v_share_link_count
    FROM public.share_links
    WHERE user_id = v_user_id;
    
    IF v_share_link_count = 1 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'first_share_link', 1, 100)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    ELSIF v_share_link_count = 5 THEN
      INSERT INTO public.vendor_milestones (user_id, milestone_type, milestone_value, points_awarded)
      VALUES (v_user_id, 'share_links_created', 5, 250)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for milestone checking
CREATE TRIGGER check_product_milestones
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_award_milestones();

CREATE TRIGGER check_share_link_milestones
  AFTER INSERT ON public.share_links
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_award_milestones();