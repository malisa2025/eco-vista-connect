-- Add video and additional images columns to business_products
ALTER TABLE public.business_products
ADD COLUMN video_url TEXT,
ADD COLUMN video_thumbnail_url TEXT,
ADD COLUMN additional_images TEXT[];