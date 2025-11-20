-- Change delivery_date to dispatches_in_days (integer for number of working days)
ALTER TABLE public.products 
DROP COLUMN delivery_date;

ALTER TABLE public.products 
ADD COLUMN dispatches_in_days integer;

COMMENT ON COLUMN public.products.dispatches_in_days IS 'Number of working days for dispatch. NULL or 0 means immediate delivery.';