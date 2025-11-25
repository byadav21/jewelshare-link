-- Fix function search path for check_and_award_milestones
CREATE OR REPLACE FUNCTION public.check_and_award_milestones()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;