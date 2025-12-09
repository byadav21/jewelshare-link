-- Drop the trigger first (correct trigger name)
DROP TRIGGER IF EXISTS diamond_price_change_trigger ON public.diamond_prices;

-- Now drop the function
DROP FUNCTION IF EXISTS public.log_diamond_price_change();

-- Clear existing historical data
TRUNCATE TABLE public.diamond_price_history;