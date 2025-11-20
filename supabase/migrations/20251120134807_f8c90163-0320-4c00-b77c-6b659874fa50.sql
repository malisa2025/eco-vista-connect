-- Add business_hours column to businesses table
ALTER TABLE public.businesses
ADD COLUMN business_hours jsonb;

-- Add gallery_images column to businesses table
ALTER TABLE public.businesses
ADD COLUMN gallery_images text[];

-- Create favorites table
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, business_id)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites RLS policies
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create business_views table for tracking
CREATE TABLE public.business_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS on business_views
ALTER TABLE public.business_views ENABLE ROW LEVEL SECURITY;

-- Business views RLS policies
CREATE POLICY "Anyone can create views"
  ON public.business_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Business owners can view their business views"
  ON public.business_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_owners
      WHERE business_id = business_views.business_id
        AND user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );