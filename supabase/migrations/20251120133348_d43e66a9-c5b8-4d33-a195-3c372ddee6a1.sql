-- Create business_categories table
CREATE TABLE public.business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  image_url TEXT,
  rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "Allow public read access to categories"
  ON public.business_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to businesses"
  ON public.businesses
  FOR SELECT
  USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for businesses table
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed business categories
INSERT INTO public.business_categories (name, icon, description) VALUES
  ('Technology', 'Laptop', 'Tech companies, software, IT services'),
  ('Food & Beverage', 'Utensils', 'Restaurants, cafes, food delivery'),
  ('Retail', 'ShoppingBag', 'Shops, stores, markets'),
  ('Healthcare', 'Heart', 'Hospitals, clinics, pharmacies'),
  ('Education', 'GraduationCap', 'Schools, training centers, tutoring'),
  ('Finance', 'Building2', 'Banks, insurance, financial services'),
  ('Real Estate', 'Home', 'Property, rentals, construction'),
  ('Entertainment', 'Film', 'Events, venues, recreation'),
  ('Automotive', 'Car', 'Car sales, repairs, services'),
  ('Beauty & Wellness', 'Sparkles', 'Salons, spas, fitness centers');

-- Seed sample businesses (diverse across regions)
INSERT INTO public.businesses (name, description, category, region, address, phone, email, website, rating, review_count, is_verified, is_featured, latitude, longitude) VALUES
  -- Greater Accra
  ('TechHub Ghana', 'Leading software development and IT consulting firm', 'Technology', 'Greater Accra', 'Osu, Accra', '+233 20 123 4567', 'info@techhub.gh', 'https://techhub.gh', 4.8, 156, true, true, 5.6037, -0.1870),
  ('Skyy Restaurant', 'Fine dining with panoramic city views', 'Food & Beverage', 'Greater Accra', 'Cantonments, Accra', '+233 30 276 5421', 'contact@skyy.com.gh', 'https://skyy.com.gh', 4.5, 203, true, true, 5.5600, -0.1817),
  ('Accra Mall', 'Premier shopping and entertainment center', 'Retail', 'Greater Accra', 'Tetteh Quarshie, Accra', '+233 30 281 4001', 'info@accramall.com', 'https://accramall.com', 4.6, 892, true, false, 5.6515, -0.1733),
  ('37 Military Hospital', 'Modern healthcare facility', 'Healthcare', 'Greater Accra', '37 Station, Accra', '+233 30 277 7591', 'info@37hospital.gh', null, 4.2, 124, true, false, 5.5899, -0.1766),
  
  -- Ashanti
  ('Kumasi Tech Park', 'Innovation hub for startups and tech companies', 'Technology', 'Ashanti', 'KNUST, Kumasi', '+233 32 206 0123', 'hello@ktpark.com', 'https://ktpark.com', 4.7, 89, true, true, 6.6745, -1.5716),
  ('Kentish Kitchen', 'Traditional Ghanaian cuisine with modern twist', 'Food & Beverage', 'Ashanti', 'Adum, Kumasi', '+233 32 202 4567', 'info@kentish.gh', null, 4.4, 167, true, false, 6.6885, -1.6244),
  ('Kejetia Market', 'West Africa''s largest open-air market', 'Retail', 'Ashanti', 'Central Kumasi', '+233 50 123 4567', null, null, 4.1, 456, false, false, 6.6969, -1.6294),
  
  -- Western
  ('Sekondi Digital Hub', 'Co-working space and tech training center', 'Technology', 'Western', 'Sekondi, Takoradi', '+233 31 202 3456', 'info@sdh.com.gh', 'https://sdh.com.gh', 4.3, 67, true, false, 4.9347, -1.7035),
  ('Beachfront Bistro', 'Seafood restaurant with ocean views', 'Food & Beverage', 'Western', 'Takoradi Beach', '+233 31 202 7890', 'reservations@beachfrontbistro.gh', null, 4.6, 201, true, true, 4.8967, -1.7553),
  
  -- Eastern
  ('Koforidua Shopping Center', 'Modern retail complex', 'Retail', 'Eastern', 'Koforidua Town', '+233 34 202 1234', 'info@ksc.com.gh', null, 4.2, 134, false, false, 6.0940, -0.2600),
  ('Eastern Regional Hospital', 'Main regional healthcare facility', 'Healthcare', 'Eastern', 'Koforidua', '+233 34 202 2345', null, null, 4.0, 89, true, false, 6.0840, -0.2550),
  
  -- Northern
  ('Tamale Innovation Center', 'Tech education and entrepreneurship hub', 'Technology', 'Northern', 'Tamale Central', '+233 37 202 3456', 'contact@tic.gh', 'https://tic.gh', 4.5, 78, true, false, 9.4034, -0.8424),
  ('Savannah Grill', 'Northern Ghanaian specialty restaurant', 'Food & Beverage', 'Northern', 'Tamale Market Circle', '+233 37 202 4567', null, null, 4.3, 92, false, false, 9.4050, -0.8393),
  
  -- Volta
  ('Ho Tech Solutions', 'IT services and web development', 'Technology', 'Volta', 'Ho Town', '+233 36 202 5678', 'info@hotech.gh', 'https://hotech.gh', 4.4, 56, true, false, 6.6108, 0.4710),
  ('Volta Serene Hotel', 'Boutique hotel and restaurant', 'Food & Beverage', 'Volta', 'Ho Central', '+233 36 202 6789', 'reservations@voltaserene.com', 'https://voltaserene.com', 4.7, 178, true, true, 6.6005, 0.4700),
  
  -- Central
  ('Cape Coast Digital Academy', 'Coding bootcamp and tech training', 'Education', 'Central', 'Cape Coast', '+233 33 213 2345', 'admissions@ccda.edu.gh', 'https://ccda.edu.gh', 4.6, 112, true, false, 5.1054, -1.2466),
  ('Elmina Bay Resort', 'Luxury resort with fine dining', 'Food & Beverage', 'Central', 'Elmina', '+233 33 213 3456', 'info@elminabay.com', 'https://elminabay.com', 4.8, 234, true, true, 5.0833, -1.3500),
  
  -- Upper East
  ('Bolgatanga Craft Market', 'Traditional crafts and textiles', 'Retail', 'Upper East', 'Bolgatanga Central', '+233 38 202 4567', null, null, 4.2, 67, false, false, 10.7856, -0.8514),
  
  -- Upper West
  ('Wa Regional Hospital', 'Healthcare services for Upper West', 'Healthcare', 'Upper West', 'Wa Town', '+233 39 202 5678', null, null, 3.9, 45, true, false, 10.0603, -2.5095),
  
  -- Brong-Ahafo
  ('Sunyani Business Hub', 'Co-working and business center', 'Technology', 'Brong-Ahafo', 'Sunyani Central', '+233 35 202 6789', 'info@sbh.gh', null, 4.3, 72, false, false, 7.3339, -2.3265),
  
  -- More featured businesses
  ('Ghana Tech Ventures', 'Venture capital and startup accelerator', 'Finance', 'Greater Accra', 'Airport Residential, Accra', '+233 30 296 5432', 'invest@ghanatech.vc', 'https://ghanatech.vc', 4.9, 45, true, true, 5.6052, -0.1719),
  ('Wellness Spa Accra', 'Premium spa and wellness center', 'Beauty & Wellness', 'Greater Accra', 'East Legon, Accra', '+233 20 876 5432', 'bookings@wellnessspa.gh', 'https://wellnessspa.gh', 4.7, 189, true, true, 5.6428, -0.1549),
  ('AutoCare Ghana', 'Professional car maintenance and repair', 'Automotive', 'Greater Accra', 'Spintex Road, Accra', '+233 30 254 3210', 'service@autocare.gh', 'https://autocare.gh', 4.5, 312, true, false, 5.6342, -0.1104);

-- Create indexes for better query performance
CREATE INDEX idx_businesses_region ON public.businesses(region);
CREATE INDEX idx_businesses_category ON public.businesses(category);
CREATE INDEX idx_businesses_is_featured ON public.businesses(is_featured);
CREATE INDEX idx_businesses_rating ON public.businesses(rating DESC);
CREATE INDEX idx_businesses_name ON public.businesses(name);