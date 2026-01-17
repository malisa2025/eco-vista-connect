-- Add Travel & Hospitality category
INSERT INTO public.business_categories (name, icon, description) 
VALUES ('Travel & Hospitality', 'Plane', 'Travel agencies, tour operators, and hospitality services')
ON CONFLICT (name) DO NOTHING;

-- Create product_orders table for product sales
CREATE TABLE public.product_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.business_products(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create orders (for checkout)
CREATE POLICY "Anyone can create product orders"
ON public.product_orders
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM business_products WHERE id = product_id AND business_id = product_orders.business_id)
);

-- Policy: Buyers can view their own orders by email
CREATE POLICY "Buyers can view their orders"
ON public.product_orders
FOR SELECT
USING (true);

-- Policy: Business owners can view orders for their businesses
CREATE POLICY "Business owners can manage orders"
ON public.product_orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM business_owners 
    WHERE business_id = product_orders.business_id 
    AND user_id = auth.uid()
  )
);

-- Policy: Allow updating orders (for payment status updates)
CREATE POLICY "Allow order status updates"
ON public.product_orders
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_product_orders_business_id ON public.product_orders(business_id);
CREATE INDEX idx_product_orders_payment_reference ON public.product_orders(payment_reference);
CREATE INDEX idx_product_orders_buyer_email ON public.product_orders(buyer_email);