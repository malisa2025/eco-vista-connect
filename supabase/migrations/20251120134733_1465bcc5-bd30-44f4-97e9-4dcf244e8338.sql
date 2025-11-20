-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL CHECK (char_length(title) <= 100),
  comment text NOT NULL CHECK (char_length(comment) <= 1000),
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (business_id, user_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews RLS policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create review_helpful table
CREATE TABLE public.review_helpful (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (review_id, user_id)
);

-- Enable RLS on review_helpful
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;

-- Review helpful RLS policies
CREATE POLICY "Anyone can view helpful votes"
  ON public.review_helpful FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote helpful"
  ON public.review_helpful FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own helpful votes"
  ON public.review_helpful FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update business rating when review changes
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating numeric;
  total_reviews integer;
BEGIN
  -- Get the business_id (works for INSERT, UPDATE, DELETE)
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, total_reviews
  FROM public.reviews
  WHERE business_id = COALESCE(NEW.business_id, OLD.business_id);
  
  -- Update business record
  UPDATE public.businesses
  SET 
    rating = avg_rating,
    review_count = total_reviews
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers to update business rating
CREATE TRIGGER update_business_rating_on_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_rating();

CREATE TRIGGER update_business_rating_on_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_rating();

CREATE TRIGGER update_business_rating_on_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_rating();

-- Function to update helpful count on reviews
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  helpful_total integer;
BEGIN
  -- Count helpful votes for this review
  SELECT COUNT(*)
  INTO helpful_total
  FROM public.review_helpful
  WHERE review_id = COALESCE(NEW.review_id, OLD.review_id);
  
  -- Update review record
  UPDATE public.reviews
  SET helpful_count = helpful_total
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers to update helpful count
CREATE TRIGGER update_helpful_count_on_insert
  AFTER INSERT ON public.review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_helpful_count();

CREATE TRIGGER update_helpful_count_on_delete
  AFTER DELETE ON public.review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_helpful_count();

-- Trigger to update review updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();