-- Create business_menu_items table for restaurants
CREATE TABLE public.business_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Main Course',
  image_url TEXT,
  dietary_tags TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business_products table for general businesses
CREATE TABLE public.business_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'General',
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create restaurant_reservations table
CREATE TABLE public.restaurant_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_reference TEXT NOT NULL UNIQUE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  table_preference TEXT,
  occasion TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.business_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_menu_items
CREATE POLICY "Anyone can view menu items"
  ON public.business_menu_items FOR SELECT
  USING (true);

CREATE POLICY "Business owners can manage their menu items"
  ON public.business_menu_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.business_owners
    WHERE business_owners.business_id = business_menu_items.business_id
    AND business_owners.user_id = auth.uid()
  ));

-- RLS Policies for business_products
CREATE POLICY "Anyone can view products"
  ON public.business_products FOR SELECT
  USING (true);

CREATE POLICY "Business owners can manage their products"
  ON public.business_products FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.business_owners
    WHERE business_owners.business_id = business_products.business_id
    AND business_owners.user_id = auth.uid()
  ));

-- RLS Policies for restaurant_reservations
CREATE POLICY "Anyone can create reservations"
  ON public.restaurant_reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own reservations"
  ON public.restaurant_reservations FOR SELECT
  USING (
    auth.uid() = user_id 
    OR guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.business_owners
      WHERE business_owners.business_id = restaurant_reservations.business_id
      AND business_owners.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can cancel their own reservations"
  ON public.restaurant_reservations FOR UPDATE
  USING (
    (auth.uid() = user_id OR guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
    AND status IN ('pending', 'confirmed')
  );

CREATE POLICY "Business owners can manage their reservations"
  ON public.restaurant_reservations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.business_owners
    WHERE business_owners.business_id = restaurant_reservations.business_id
    AND business_owners.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all reservations"
  ON public.restaurant_reservations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_menu_items_business_id ON public.business_menu_items(business_id);
CREATE INDEX idx_menu_items_category ON public.business_menu_items(category);
CREATE INDEX idx_products_business_id ON public.business_products(business_id);
CREATE INDEX idx_products_category ON public.business_products(category);
CREATE INDEX idx_reservations_business_id ON public.restaurant_reservations(business_id);
CREATE INDEX idx_reservations_user_id ON public.restaurant_reservations(user_id);
CREATE INDEX idx_reservations_date ON public.restaurant_reservations(reservation_date);
CREATE INDEX idx_reservations_status ON public.restaurant_reservations(status);

-- Create function to generate booking reference
CREATE OR REPLACE FUNCTION generate_reservation_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    NEW.booking_reference := 'RES-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating booking reference
CREATE TRIGGER set_reservation_reference
  BEFORE INSERT ON public.restaurant_reservations
  FOR EACH ROW
  EXECUTE FUNCTION generate_reservation_reference();

-- Create updated_at triggers
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.business_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.business_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.restaurant_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();