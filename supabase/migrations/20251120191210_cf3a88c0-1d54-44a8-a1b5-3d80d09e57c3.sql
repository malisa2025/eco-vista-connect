-- Add RLS policy to allow business owners to update their businesses
CREATE POLICY "Business owners can update their business media"
ON businesses FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM business_owners 
    WHERE business_id = businesses.id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM business_owners 
    WHERE business_id = businesses.id
  )
);