-- Fix overly permissive RLS policies for product_orders

-- Drop the permissive policies
DROP POLICY IF EXISTS "Allow order status updates" ON product_orders;
DROP POLICY IF EXISTS "Buyers can view their orders" ON product_orders;

-- Create more restrictive SELECT policy - buyers can view by email match
CREATE POLICY "Buyers can view their orders by email"
ON product_orders
FOR SELECT
USING (
  -- Authenticated users can view orders matching their email
  (auth.uid() IS NOT NULL AND buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  OR
  -- Business owners can view their orders
  EXISTS (
    SELECT 1 FROM business_owners 
    WHERE business_id = product_orders.business_id 
    AND user_id = auth.uid()
  )
  OR
  -- Allow viewing by payment reference (for verification callbacks)
  payment_reference IS NOT NULL
);

-- Create restrictive UPDATE policy - only for payment verification via service role or business owners
CREATE POLICY "Business owners can update order status"
ON product_orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM business_owners 
    WHERE business_id = product_orders.business_id 
    AND user_id = auth.uid()
  )
);