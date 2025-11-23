-- Create custom enums for hotel booking system
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE amenity_category AS ENUM ('room', 'property', 'service', 'accessibility');

-- Hotel Properties Table (extends businesses table)
CREATE TABLE public.hotel_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  check_in_time TIME NOT NULL DEFAULT '14:00',
  check_out_time TIME NOT NULL DEFAULT '11:00',
  cancellation_policy TEXT,
  house_rules TEXT,
  parking_available BOOLEAN DEFAULT false,
  wifi_available BOOLEAN DEFAULT false,
  restaurant_on_site BOOLEAN DEFAULT false,
  pool_available BOOLEAN DEFAULT false,
  gym_available BOOLEAN DEFAULT false,
  spa_available BOOLEAN DEFAULT false,
  total_rooms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id)
);

-- Hotel Amenities Table
CREATE TABLE public.hotel_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotel_properties(id) ON DELETE CASCADE,
  amenity_type amenity_category NOT NULL,
  amenity_name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Room Types Table
CREATE TABLE public.room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotel_properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  bed_configuration TEXT,
  room_size_sqm NUMERIC,
  base_price_per_night NUMERIC NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  quantity INTEGER NOT NULL DEFAULT 1,
  amenities JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Room Availability Table
CREATE TABLE public.room_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  price_override NUMERIC,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'limited', 'sold_out')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(room_type_id, date)
);

-- Hotel Bookings Table
CREATE TABLE public.hotel_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT UNIQUE NOT NULL,
  hotel_id UUID NOT NULL REFERENCES public.hotel_properties(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_rooms INTEGER DEFAULT 1,
  number_of_guests INTEGER NOT NULL,
  number_of_nights INTEGER NOT NULL,
  total_price NUMERIC NOT NULL,
  status booking_status DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_reference TEXT,
  payment_method TEXT DEFAULT 'paystack',
  special_requests TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Hotel Enquiries Table
CREATE TABLE public.hotel_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotel_properties(id) ON DELETE CASCADE,
  room_type_id UUID REFERENCES public.room_types(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in_date DATE,
  check_out_date DATE,
  number_of_guests INTEGER,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'replied', 'converted', 'closed')),
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Booking Guests Table
CREATE TABLE public.booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.hotel_bookings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_age INTEGER,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seasonal Pricing Table
CREATE TABLE public.seasonal_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_modifier NUMERIC NOT NULL,
  modifier_type TEXT DEFAULT 'percentage' CHECK (modifier_type IN ('percentage', 'fixed')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_hotel_properties_business_id ON public.hotel_properties(business_id);
CREATE INDEX idx_room_types_hotel_id ON public.room_types(hotel_id);
CREATE INDEX idx_room_availability_date ON public.room_availability(date);
CREATE INDEX idx_hotel_bookings_check_in ON public.hotel_bookings(check_in_date);
CREATE INDEX idx_hotel_bookings_status ON public.hotel_bookings(status);
CREATE INDEX idx_hotel_bookings_user_id ON public.hotel_bookings(user_id);
CREATE INDEX idx_hotel_bookings_guest_email ON public.hotel_bookings(guest_email);

-- Database Functions

-- Generate unique booking reference
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    ref := 'HTL-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM hotel_bookings WHERE booking_reference = ref) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN ref;
END;
$$;

-- Calculate available rooms for a date range
CREATE OR REPLACE FUNCTION public.calculate_available_rooms(
  p_room_type_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_rooms INTEGER;
  v_min_available INTEGER;
BEGIN
  -- Get total quantity of this room type
  SELECT quantity INTO v_total_rooms
  FROM room_types
  WHERE id = p_room_type_id;
  
  -- Find minimum available rooms across the date range
  SELECT COALESCE(MIN(
    v_total_rooms - COALESCE((
      SELECT SUM(number_of_rooms)
      FROM hotel_bookings
      WHERE room_type_id = p_room_type_id
      AND status NOT IN ('cancelled')
      AND check_in_date <= generate_series.date
      AND check_out_date > generate_series.date
    ), 0)
  ), v_total_rooms) INTO v_min_available
  FROM generate_series(p_start_date, p_end_date - INTERVAL '1 day', INTERVAL '1 day') AS generate_series(date);
  
  RETURN GREATEST(v_min_available, 0);
END;
$$;

-- Calculate booking price with seasonal adjustments
CREATE OR REPLACE FUNCTION public.calculate_booking_price(
  p_room_type_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_num_rooms INTEGER DEFAULT 1
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_price NUMERIC;
  v_total_price NUMERIC := 0;
  v_date DATE;
  v_night_price NUMERIC;
BEGIN
  -- Get base price
  SELECT base_price_per_night INTO v_base_price
  FROM room_types
  WHERE id = p_room_type_id;
  
  -- Calculate price for each night
  FOR v_date IN SELECT generate_series(p_check_in, p_check_out - INTERVAL '1 day', INTERVAL '1 day')::DATE
  LOOP
    v_night_price := v_base_price;
    
    -- Check for seasonal pricing
    SELECT 
      CASE 
        WHEN modifier_type = 'percentage' THEN v_base_price * (1 + price_modifier / 100)
        WHEN modifier_type = 'fixed' THEN v_base_price + price_modifier
        ELSE v_base_price
      END INTO v_night_price
    FROM seasonal_pricing
    WHERE room_type_id = p_room_type_id
    AND v_date BETWEEN start_date AND end_date
    AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
    
    v_total_price := v_total_price + COALESCE(v_night_price, v_base_price);
  END LOOP;
  
  RETURN v_total_price * p_num_rooms;
END;
$$;

-- Check room availability
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_room_type_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_num_rooms INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available INTEGER;
BEGIN
  v_available := calculate_available_rooms(p_room_type_id, p_check_in, p_check_out);
  RETURN v_available >= p_num_rooms;
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_hotel_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_hotel_properties_updated_at
BEFORE UPDATE ON public.hotel_properties
FOR EACH ROW
EXECUTE FUNCTION public.update_hotel_updated_at();

CREATE TRIGGER update_room_types_updated_at
BEFORE UPDATE ON public.room_types
FOR EACH ROW
EXECUTE FUNCTION public.update_hotel_updated_at();

CREATE TRIGGER update_hotel_bookings_updated_at
BEFORE UPDATE ON public.hotel_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_hotel_updated_at();

-- RLS Policies

-- hotel_properties
ALTER TABLE public.hotel_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hotels"
ON public.hotel_properties FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM businesses b
    WHERE b.id = hotel_properties.business_id
  )
);

CREATE POLICY "Hotel owners can manage their properties"
ON public.hotel_properties FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM business_owners bo
    WHERE bo.business_id = hotel_properties.business_id
    AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all hotels"
ON public.hotel_properties FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- hotel_amenities
ALTER TABLE public.hotel_amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view amenities"
ON public.hotel_amenities FOR SELECT
USING (true);

CREATE POLICY "Hotel owners can manage their amenities"
ON public.hotel_amenities FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM hotel_properties hp
    JOIN business_owners bo ON bo.business_id = hp.business_id
    WHERE hp.id = hotel_amenities.hotel_id
    AND bo.user_id = auth.uid()
  )
);

-- room_types
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rooms"
ON public.room_types FOR SELECT
USING (is_active = true OR EXISTS (
  SELECT 1 FROM hotel_properties hp
  JOIN business_owners bo ON bo.business_id = hp.business_id
  WHERE hp.id = room_types.hotel_id
  AND bo.user_id = auth.uid()
));

CREATE POLICY "Hotel owners can manage their rooms"
ON public.room_types FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM hotel_properties hp
    JOIN business_owners bo ON bo.business_id = hp.business_id
    WHERE hp.id = room_types.hotel_id
    AND bo.user_id = auth.uid()
  )
);

-- room_availability
ALTER TABLE public.room_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view room availability"
ON public.room_availability FOR SELECT
USING (true);

CREATE POLICY "Hotel owners can manage availability"
ON public.room_availability FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM room_types rt
    JOIN hotel_properties hp ON hp.id = rt.hotel_id
    JOIN business_owners bo ON bo.business_id = hp.business_id
    WHERE rt.id = room_availability.room_type_id
    AND bo.user_id = auth.uid()
  )
);

-- hotel_bookings
ALTER TABLE public.hotel_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
ON public.hotel_bookings FOR SELECT
USING (
  auth.uid() = user_id 
  OR guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM hotel_properties hp
    JOIN business_owners bo ON bo.business_id = hp.business_id
    WHERE hp.id = hotel_bookings.hotel_id
    AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create bookings"
ON public.hotel_bookings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Hotel owners can update booking status"
ON public.hotel_bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM hotel_properties hp
    JOIN business_owners bo ON bo.business_id = hp.business_id
    WHERE hp.id = hotel_bookings.hotel_id
    AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Users can cancel their own bookings"
ON public.hotel_bookings FOR UPDATE
USING (
  auth.uid() = user_id 
  AND status IN ('pending', 'confirmed')
);

CREATE POLICY "Admins can manage all bookings"
ON public.hotel_bookings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- hotel_enquiries
ALTER TABLE public.hotel_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create enquiries"
ON public.hotel_enquiries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Hotel owners can view their enquiries"
ON public.hotel_enquiries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM hotel_properties hp
    JOIN business_owners bo ON bo.business_id = hp.business_id
    WHERE hp.id = hotel_enquiries.hotel_id
    AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Hotel owners can update their enquiries"
ON public.hotel_enquiries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM hotel_properties hp
    JOIN business_owners bo ON bo.business_id = hp.business_id
    WHERE hp.id = hotel_enquiries.hotel_id
    AND bo.user_id = auth.uid()
  )
);

-- booking_guests
ALTER TABLE public.booking_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage guests for their bookings"
ON public.booking_guests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM hotel_bookings hb
    WHERE hb.id = booking_guests.booking_id
    AND (hb.user_id = auth.uid() OR hb.guest_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

-- seasonal_pricing
ALTER TABLE public.seasonal_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active seasonal pricing"
ON public.seasonal_pricing FOR SELECT
USING (is_active = true);

CREATE POLICY "Hotel owners can manage seasonal pricing"
ON public.seasonal_pricing FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM room_types rt
    JOIN hotel_properties hp ON hp.id = rt.hotel_id
    JOIN business_owners bo ON bo.business_id = hp.business_id
    WHERE rt.id = seasonal_pricing.room_type_id
    AND bo.user_id = auth.uid()
  )
);