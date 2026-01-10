-- Create business_type enum
CREATE TYPE public.business_type AS ENUM (
  'restaurant', 
  'hotel', 
  'retail', 
  'services', 
  'healthcare', 
  'other'
);

-- Add business_type column to businesses table
ALTER TABLE public.businesses ADD COLUMN business_type public.business_type;

-- Auto-populate business_type based on existing category for existing records
UPDATE public.businesses SET business_type = 
  CASE 
    WHEN lower(category) LIKE '%restaurant%' OR lower(category) LIKE '%food%' OR lower(category) LIKE '%cafe%' OR lower(category) LIKE '%bakery%' THEN 'restaurant'::public.business_type
    WHEN lower(category) LIKE '%hotel%' OR lower(category) LIKE '%accommodation%' OR lower(category) LIKE '%lodge%' OR lower(category) LIKE '%guest%' THEN 'hotel'::public.business_type
    WHEN lower(category) LIKE '%shop%' OR lower(category) LIKE '%store%' OR lower(category) LIKE '%retail%' OR lower(category) LIKE '%market%' THEN 'retail'::public.business_type
    WHEN lower(category) LIKE '%health%' OR lower(category) LIKE '%hospital%' OR lower(category) LIKE '%clinic%' OR lower(category) LIKE '%pharmacy%' THEN 'healthcare'::public.business_type
    WHEN lower(category) LIKE '%service%' OR lower(category) LIKE '%consulting%' OR lower(category) LIKE '%agency%' THEN 'services'::public.business_type
    ELSE 'other'::public.business_type
  END
WHERE business_type IS NULL;