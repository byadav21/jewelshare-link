-- Create diamond price history table
CREATE TABLE IF NOT EXISTS public.diamond_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_id UUID NOT NULL,
  shape TEXT NOT NULL,
  carat_range_min NUMERIC NOT NULL,
  carat_range_max NUMERIC NOT NULL,
  color_grade TEXT NOT NULL,
  clarity_grade TEXT NOT NULL,
  cut_grade TEXT NOT NULL,
  old_price_per_carat NUMERIC,
  new_price_per_carat NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  change_type TEXT NOT NULL CHECK (change_type IN ('insert', 'update', 'delete')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX idx_diamond_price_history_price_id ON public.diamond_price_history(price_id);
CREATE INDEX idx_diamond_price_history_changed_at ON public.diamond_price_history(changed_at DESC);
CREATE INDEX idx_diamond_price_history_shape ON public.diamond_price_history(shape);

-- Enable RLS
ALTER TABLE public.diamond_price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all price history"
  ON public.diamond_price_history
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert price history"
  ON public.diamond_price_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to log price changes
CREATE OR REPLACE FUNCTION public.log_diamond_price_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.diamond_price_history (
      price_id,
      shape,
      carat_range_min,
      carat_range_max,
      color_grade,
      clarity_grade,
      cut_grade,
      old_price_per_carat,
      new_price_per_carat,
      currency,
      change_type,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.shape,
      NEW.carat_range_min,
      NEW.carat_range_max,
      NEW.color_grade,
      NEW.clarity_grade,
      NEW.cut_grade,
      NULL,
      NEW.price_per_carat,
      NEW.currency,
      'insert',
      auth.uid()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Only log if price actually changed
    IF OLD.price_per_carat != NEW.price_per_carat THEN
      INSERT INTO public.diamond_price_history (
        price_id,
        shape,
        carat_range_min,
        carat_range_max,
        color_grade,
        clarity_grade,
        cut_grade,
        old_price_per_carat,
        new_price_per_carat,
        currency,
        change_type,
        changed_by
      ) VALUES (
        NEW.id,
        NEW.shape,
        NEW.carat_range_min,
        NEW.carat_range_max,
        NEW.color_grade,
        NEW.clarity_grade,
        NEW.cut_grade,
        OLD.price_per_carat,
        NEW.price_per_carat,
        NEW.currency,
        'update',
        auth.uid()
      );
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.diamond_price_history (
      price_id,
      shape,
      carat_range_min,
      carat_range_max,
      color_grade,
      clarity_grade,
      cut_grade,
      old_price_per_carat,
      new_price_per_carat,
      currency,
      change_type,
      changed_by
    ) VALUES (
      OLD.id,
      OLD.shape,
      OLD.carat_range_min,
      OLD.carat_range_max,
      OLD.color_grade,
      OLD.clarity_grade,
      OLD.cut_grade,
      OLD.price_per_carat,
      OLD.price_per_carat,
      OLD.currency,
      'delete',
      auth.uid()
    );
    RETURN OLD;
  END IF;
END;
$$;

-- Create trigger for diamond_prices table
CREATE TRIGGER diamond_price_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.diamond_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.log_diamond_price_change();