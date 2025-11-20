-- Advertisement system tables
CREATE TYPE public.ad_spot_location AS ENUM ('home_hero', 'home_sidebar', 'business_list_top', 'business_detail_sidebar', 'search_results');
CREATE TYPE public.ad_status AS ENUM ('draft', 'pending_payment', 'active', 'paused', 'expired');

CREATE TABLE public.ad_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location ad_spot_location NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_per_day NUMERIC(10, 2) NOT NULL,
  max_ads INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  ad_spot_id UUID REFERENCES public.ad_spots(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ad_status DEFAULT 'draft',
  total_cost NUMERIC(10, 2) NOT NULL,
  stripe_payment_id TEXT,
  impressions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertisement_id UUID REFERENCES public.advertisements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.ad_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- Ad spots policies (public read)
CREATE POLICY "Anyone can view ad spots"
ON public.ad_spots
FOR SELECT
USING (true);

-- Advertisements policies
CREATE POLICY "Anyone can view active ads"
ON public.advertisements
FOR SELECT
USING (status = 'active' OR auth.uid() IN (
  SELECT user_id FROM public.business_owners
  WHERE business_owners.business_id = advertisements.business_id
));

CREATE POLICY "Business owners can create ads for their businesses"
ON public.advertisements
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.business_owners
    WHERE business_owners.business_id = advertisements.business_id
  )
);

CREATE POLICY "Business owners can update their ads"
ON public.advertisements
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.business_owners
    WHERE business_owners.business_id = advertisements.business_id
  )
);

CREATE POLICY "Admins can manage all ads"
ON public.advertisements
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Ad clicks policies
CREATE POLICY "Anyone can record ad clicks"
ON public.ad_clicks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Business owners can view their ad clicks"
ON public.ad_clicks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.advertisements
    JOIN public.business_owners ON business_owners.business_id = advertisements.business_id
    WHERE advertisements.id = ad_clicks.advertisement_id
    AND business_owners.user_id = auth.uid()
  )
);

-- Indexes
CREATE INDEX idx_advertisements_business_id ON public.advertisements(business_id);
CREATE INDEX idx_advertisements_ad_spot_id ON public.advertisements(ad_spot_id);
CREATE INDEX idx_advertisements_dates ON public.advertisements(start_date, end_date);
CREATE INDEX idx_ad_clicks_advertisement_id ON public.ad_clicks(advertisement_id);

-- Trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default ad spots
INSERT INTO public.ad_spots (location, name, description, price_per_day, max_ads) VALUES
('home_hero', 'Home Hero Banner', 'Premium banner at the top of the homepage', 50.00, 1),
('home_sidebar', 'Home Sidebar', 'Sidebar advertisement on homepage', 20.00, 3),
('business_list_top', 'Business Listing Top', 'Featured spot at top of business listings', 30.00, 2),
('business_detail_sidebar', 'Business Detail Sidebar', 'Sidebar on business detail pages', 15.00, 2),
('search_results', 'Search Results', 'Promoted listing in search results', 25.00, 3);