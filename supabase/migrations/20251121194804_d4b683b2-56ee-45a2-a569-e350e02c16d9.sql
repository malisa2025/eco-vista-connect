-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for ordering and filtering
CREATE INDEX idx_partners_display_order ON public.partners(display_order);
CREATE INDEX idx_partners_is_active ON public.partners(is_active);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view active partners (for homepage)
CREATE POLICY "Anyone can view active partners"
  ON public.partners
  FOR SELECT
  USING (is_active = true);

-- Admins can view all partners (including inactive)
CREATE POLICY "Admins can view all partners"
  ON public.partners
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert partners
CREATE POLICY "Admins can insert partners"
  ON public.partners
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update partners
CREATE POLICY "Admins can update partners"
  ON public.partners
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete partners
CREATE POLICY "Admins can delete partners"
  ON public.partners
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial seed data using demo logos
INSERT INTO public.partners (name, logo_url, website_url, display_order, is_active) VALUES
  ('Ghana Chamber of Commerce', '/demo/tech-logo.jpg', 'https://www.ghanachamber.org', 1, true),
  ('Ghana Export Promotion Authority', '/demo/fashion-logo.jpg', 'https://www.gepaghana.org', 2, true),
  ('Ghana Police Service', '/demo/restaurant-logo.jpg', 'https://police.gov.gh', 3, true),
  ('Bank of Ghana', '/demo/tech-logo.jpg', 'https://www.bog.gov.gh', 4, true),
  ('Ghana Revenue Authority', '/demo/fashion-logo.jpg', 'https://gra.gov.gh', 5, true),
  ('Ministry of Trade and Industry', '/demo/restaurant-logo.jpg', NULL, 6, true),
  ('Ghana Investment Promotion Centre', '/demo/tech-logo.jpg', NULL, 7, true),
  ('GCB Bank', '/demo/fashion-logo.jpg', NULL, 8, true),
  ('Ecobank Ghana', '/demo/restaurant-logo.jpg', NULL, 9, true),
  ('Ghana Standards Authority', '/demo/tech-logo.jpg', NULL, 10, true);