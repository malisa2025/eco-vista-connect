-- Create event_tickets table for ticketing system
CREATE TABLE public.event_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.business_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  registration_id UUID REFERENCES public.event_registrations(id),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  ticket_type VARCHAR(50) NOT NULL DEFAULT 'regular',
  price_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_reference VARCHAR(100),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  qr_code TEXT,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  attendee_name VARCHAR(255),
  attendee_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_event_tickets_event_id ON public.event_tickets(event_id);
CREATE INDEX idx_event_tickets_user_id ON public.event_tickets(user_id);
CREATE INDEX idx_event_tickets_ticket_number ON public.event_tickets(ticket_number);
CREATE INDEX idx_event_tickets_payment_status ON public.event_tickets(payment_status);

-- Enable RLS
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.event_tickets
FOR SELECT
USING (user_id = auth.uid() OR attendee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Business owners can view tickets for their events
CREATE POLICY "Business owners can view event tickets"
ON public.event_tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM business_events e
    JOIN business_owners bo ON bo.business_id = e.business_id
    WHERE e.id = event_tickets.event_id AND bo.user_id = auth.uid()
  )
);

-- Allow inserts for ticket purchases (payment flow)
CREATE POLICY "Allow ticket creation"
ON public.event_tickets
FOR INSERT
WITH CHECK (true);

-- Users can update their own tickets (for cancellation)
CREATE POLICY "Users can update their own tickets"
ON public.event_tickets
FOR UPDATE
USING (user_id = auth.uid());

-- Business owners can update tickets (for check-in)
CREATE POLICY "Business owners can update event tickets"
ON public.event_tickets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM business_events e
    JOIN business_owners bo ON bo.business_id = e.business_id
    WHERE e.id = event_tickets.event_id AND bo.user_id = auth.uid()
  )
);

-- Function to generate unique ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Trigger for updated_at
CREATE TRIGGER update_event_tickets_updated_at
BEFORE UPDATE ON public.event_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();