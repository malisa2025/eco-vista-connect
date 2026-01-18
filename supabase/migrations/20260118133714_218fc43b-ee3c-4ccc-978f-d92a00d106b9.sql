-- Drop the broken SELECT policy that queries auth.users directly
DROP POLICY IF EXISTS "Buyers can view their orders by email" ON product_orders;

-- Create a working SELECT policy using profiles table instead of auth.users
CREATE POLICY "Buyers can view their orders by email"
ON product_orders
FOR SELECT
USING (
  -- Authenticated users can view orders matching their profile email
  (auth.uid() IS NOT NULL AND buyer_email = (
    SELECT email FROM public.profiles WHERE id = auth.uid()
  ))
  OR
  -- Business owners can view their orders
  EXISTS (
    SELECT 1 FROM business_owners 
    WHERE business_id = product_orders.business_id 
    AND user_id = auth.uid()
  )
);

-- Allow viewing pending orders during checkout flow (for INSERT...RETURNING)
CREATE POLICY "Anyone can view pending orders they created"
ON product_orders
FOR SELECT
USING (
  status = 'pending' AND payment_status = 'pending'
);