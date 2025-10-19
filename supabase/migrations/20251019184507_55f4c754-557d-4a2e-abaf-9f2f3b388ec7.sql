-- Add second image URL column to products table
ALTER TABLE public.products 
ADD COLUMN image_url_2 text;