-- Fix overly permissive insert policy for event_tickets
-- Replace WITH CHECK (true) with proper validation

DROP POLICY IF EXISTS "Allow ticket creation" ON public.event_tickets;

-- Only allow ticket creation through service role or with proper validation
CREATE POLICY "Allow ticket creation for valid events"
ON public.event_tickets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_events e
    WHERE e.id = event_tickets.event_id
    AND e.status = 'published'
    AND e.start_date > now()
  )
);

-- Fix function search path for generate_ticket_number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    new_number := 'TKT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.event_tickets WHERE ticket_number = new_number) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN new_number;
END;
$$;