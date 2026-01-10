-- Fix user_roles recursive policy
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix restaurant_reservations policies (use profiles instead of auth.users)
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.restaurant_reservations;
DROP POLICY IF EXISTS "Users can cancel their own reservations" ON public.restaurant_reservations;

CREATE POLICY "Users can view their own reservations"
  ON public.restaurant_reservations FOR SELECT
  USING (
    auth.uid() = user_id 
    OR guest_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.business_owners
      WHERE business_owners.business_id = restaurant_reservations.business_id
      AND business_owners.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can cancel their own reservations"
  ON public.restaurant_reservations FOR UPDATE
  USING (
    (auth.uid() = user_id OR guest_email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
    AND status IN ('pending', 'confirmed')
  );

-- Fix hotel_bookings policy (use profiles instead of auth.users)
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.hotel_bookings;

CREATE POLICY "Users can view their own bookings"
  ON public.hotel_bookings FOR SELECT
  USING (
    auth.uid() = user_id 
    OR guest_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM hotel_properties hp
      JOIN business_owners bo ON bo.business_id = hp.business_id
      WHERE hp.id = hotel_bookings.hotel_id
      AND bo.user_id = auth.uid()
    )
  );