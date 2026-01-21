-- Add 'travel' to business_type enum
ALTER TYPE public.business_type ADD VALUE IF NOT EXISTS 'travel';

-- Insert Travel & Tour category if not exists
INSERT INTO public.business_categories (name, icon, description)
VALUES ('Travel & Tour', 'Plane', 'Tour operators, travel agencies, safari companies')
ON CONFLICT (name) DO NOTHING;

-- Create business_events table for upcoming events
CREATE TABLE public.business_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  location VARCHAR(300),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  price DECIMAL(10, 2) DEFAULT 0,
  capacity INT,
  attendees_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  additional_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_business_events_business_id ON public.business_events(business_id);
CREATE INDEX idx_business_events_start_date ON public.business_events(start_date);
CREATE INDEX idx_business_events_status ON public.business_events(status);

-- Enable RLS
ALTER TABLE public.business_events ENABLE ROW LEVEL SECURITY;

-- Public can view published events
CREATE POLICY "Anyone can view published events"
ON public.business_events
FOR SELECT
USING (status = 'published');

-- Business owners can view all their events
CREATE POLICY "Business owners can view their events"
ON public.business_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_owners
    WHERE business_owners.business_id = business_events.business_id
    AND business_owners.user_id = auth.uid()
  )
);

-- Business owners can insert events
CREATE POLICY "Business owners can create events"
ON public.business_events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_owners
    WHERE business_owners.business_id = business_events.business_id
    AND business_owners.user_id = auth.uid()
  )
);

-- Business owners can update their events
CREATE POLICY "Business owners can update their events"
ON public.business_events
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.business_owners
    WHERE business_owners.business_id = business_events.business_id
    AND business_owners.user_id = auth.uid()
  )
);

-- Business owners can delete their events
CREATE POLICY "Business owners can delete their events"
ON public.business_events
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.business_owners
    WHERE business_owners.business_id = business_events.business_id
    AND business_owners.user_id = auth.uid()
  )
);

-- Create event_registrations table for attendees
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.business_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
CREATE POLICY "Users can view their registrations"
ON public.event_registrations
FOR SELECT
USING (user_id = auth.uid());

-- Business owners can view registrations for their events
CREATE POLICY "Business owners can view event registrations"
ON public.event_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_events e
    JOIN public.business_owners bo ON bo.business_id = e.business_id
    WHERE e.id = event_registrations.event_id
    AND bo.user_id = auth.uid()
  )
);

-- Anyone can register for events
CREATE POLICY "Anyone can register for events"
ON public.event_registrations
FOR INSERT
WITH CHECK (true);

-- Users can cancel their registrations
CREATE POLICY "Users can cancel their registrations"
ON public.event_registrations
FOR UPDATE
USING (user_id = auth.uid());

-- Trigger to update attendees_count
CREATE OR REPLACE FUNCTION public.update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.business_events
    SET attendees_count = attendees_count + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.business_events
    SET attendees_count = GREATEST(0, attendees_count - 1)
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_attendees_count_trigger
AFTER INSERT OR DELETE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_event_attendees_count();

-- Trigger for updated_at on business_events
CREATE TRIGGER update_business_events_updated_at
BEFORE UPDATE ON public.business_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();