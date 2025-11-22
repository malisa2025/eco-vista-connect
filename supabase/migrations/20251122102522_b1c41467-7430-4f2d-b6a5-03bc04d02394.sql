-- Phase 1: Foundation & Quick Wins - Database Schema

-- ============================================================
-- FEATURE 1: AI-POWERED SMART SEARCH
-- ============================================================

-- Search history tracking for personalized suggestions
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  clicked_business_id UUID REFERENCES businesses ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cache for AI-generated search suggestions
CREATE TABLE IF NOT EXISTS search_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT UNIQUE NOT NULL,
  suggestions JSONB NOT NULL,
  popularity_score INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(search_query);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_query ON search_suggestions(query);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_history
CREATE POLICY "Users can view own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for search_suggestions (public read)
CREATE POLICY "Anyone can view search suggestions"
  ON search_suggestions FOR SELECT
  USING (true);

CREATE POLICY "System can manage search suggestions"
  ON search_suggestions FOR ALL
  USING (true);

-- ============================================================
-- FEATURE 2: BUSINESS VERIFICATION SYSTEM
-- ============================================================

-- Add verification columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS verification_tier TEXT CHECK (verification_tier IN ('none', 'basic', 'government', 'premium')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users ON DELETE SET NULL;

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tier_requested TEXT NOT NULL CHECK (tier_requested IN ('basic', 'government', 'premium')),
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_business ON verification_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_businesses_verification_tier ON businesses(verification_tier);
CREATE INDEX IF NOT EXISTS idx_businesses_trust_score ON businesses(trust_score DESC);

-- Trust score calculation function
CREATE OR REPLACE FUNCTION calculate_trust_score(p_business_id UUID) 
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_rating NUMERIC;
  v_review_count INTEGER;
  v_verification_tier TEXT;
  v_logo_url TEXT;
  v_video_url TEXT;
  v_business_hours JSONB;
  v_description TEXT;
  v_phone TEXT;
  v_email TEXT;
BEGIN
  -- Get business details
  SELECT 
    rating, review_count, verification_tier, 
    logo_url, video_url, business_hours, description, phone, email
  INTO 
    v_rating, v_review_count, v_verification_tier,
    v_logo_url, v_video_url, v_business_hours, v_description, v_phone, v_email
  FROM businesses 
  WHERE id = p_business_id;
  
  -- Rating contribution (0-40 points)
  v_score := v_score + (COALESCE(v_rating, 0) * 8)::INTEGER;
  
  -- Review volume (0-20 points)
  v_score := v_score + LEAST(COALESCE(v_review_count, 0) * 2, 20);
  
  -- Verification tier (0-30 points)
  v_score := v_score + CASE 
    WHEN v_verification_tier = 'premium' THEN 30
    WHEN v_verification_tier = 'government' THEN 20
    WHEN v_verification_tier = 'basic' THEN 10
    ELSE 0
  END;
  
  -- Profile completeness (0-10 points)
  v_score := v_score + (
    CASE WHEN v_logo_url IS NOT NULL THEN 2 ELSE 0 END +
    CASE WHEN v_video_url IS NOT NULL THEN 2 ELSE 0 END +
    CASE WHEN v_business_hours IS NOT NULL THEN 2 ELSE 0 END +
    CASE WHEN LENGTH(v_description) > 100 THEN 2 ELSE 0 END +
    CASE WHEN v_phone IS NOT NULL AND v_email IS NOT NULL THEN 2 ELSE 0 END
  );
  
  -- Cap at 100
  RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update trust score
CREATE OR REPLACE FUNCTION update_trust_score_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.trust_score := calculate_trust_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_trust_score
  BEFORE INSERT OR UPDATE OF rating, review_count, verification_tier, logo_url, video_url, business_hours, description, phone, email
  ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_score_trigger();

-- RLS for verification_requests
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can create verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (
    auth.uid() = requested_by AND
    EXISTS (
      SELECT 1 FROM business_owners 
      WHERE business_id = verification_requests.business_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own verification requests"
  ON verification_requests FOR SELECT
  USING (
    auth.uid() = requested_by OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can manage verification requests"
  ON verification_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- FEATURE 3: "CURRENTLY OPEN" STATUS
-- ============================================================

-- Business status cache table
CREATE TABLE IF NOT EXISTS business_status_cache (
  business_id UUID PRIMARY KEY REFERENCES businesses ON DELETE CASCADE,
  is_open_now BOOLEAN DEFAULT FALSE,
  next_opens_at TIMESTAMPTZ,
  next_closes_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_status_open ON business_status_cache(is_open_now);

-- Function to check if business is currently open
CREATE OR REPLACE FUNCTION is_business_open(p_business_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
  v_hours JSONB;
  v_current_day TEXT;
  v_current_time TIME;
  v_day_hours JSONB;
  v_open_time TIME;
  v_close_time TIME;
BEGIN
  -- Get business hours and current Ghana time
  SELECT 
    business_hours,
    TO_CHAR((NOW() AT TIME ZONE 'Africa/Accra'), 'Day'),
    (NOW() AT TIME ZONE 'Africa/Accra')::TIME
  INTO 
    v_hours, v_current_day, v_current_time
  FROM businesses 
  WHERE id = p_business_id;
  
  -- If no hours set, return null (unknown)
  IF v_hours IS NULL THEN 
    RETURN NULL; 
  END IF;
  
  -- Get hours for current day
  v_day_hours := v_hours->TRIM(v_current_day);
  
  -- If closed today
  IF v_day_hours IS NULL OR v_day_hours->>'closed' = 'true' THEN 
    RETURN FALSE; 
  END IF;
  
  -- Check if within opening hours
  v_open_time := (v_day_hours->>'open')::TIME;
  v_close_time := (v_day_hours->>'close')::TIME;
  
  -- Handle overnight hours (e.g., 22:00 to 02:00)
  IF v_close_time < v_open_time THEN
    RETURN v_current_time >= v_open_time OR v_current_time <= v_close_time;
  ELSE
    RETURN v_current_time BETWEEN v_open_time AND v_close_time;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS for business_status_cache
ALTER TABLE business_status_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view business status"
  ON business_status_cache FOR SELECT
  USING (true);

CREATE POLICY "System can manage business status"
  ON business_status_cache FOR ALL
  USING (true);

-- ============================================================
-- FEATURE 4: REVIEW AUTHENTICITY SYSTEM
-- ============================================================

-- Add authenticity columns to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS authenticity_score INTEGER DEFAULT 50 CHECK (authenticity_score >= 0 AND authenticity_score <= 100),
ADD COLUMN IF NOT EXISTS flagged_as_fake BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- Review flags table
CREATE TABLE IF NOT EXISTS review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews ON DELETE CASCADE NOT NULL,
  flagged_by UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_review_flags_review ON review_flags(review_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_status ON review_flags(status);
CREATE INDEX IF NOT EXISTS idx_reviews_authenticity ON reviews(authenticity_score);

-- RLS for review_flags
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can flag reviews"
  ON review_flags FOR INSERT
  WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Users can view own flags"
  ON review_flags FOR SELECT
  USING (
    auth.uid() = flagged_by OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can manage review flags"
  ON review_flags FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- INITIAL DATA & CLEANUP
-- ============================================================

-- Update existing businesses with default trust scores
UPDATE businesses SET trust_score = 0 WHERE trust_score IS NULL;

-- Recalculate trust scores for all businesses
DO $$
DECLARE
  business_record RECORD;
BEGIN
  FOR business_record IN SELECT id FROM businesses LOOP
    UPDATE businesses 
    SET trust_score = calculate_trust_score(business_record.id)
    WHERE id = business_record.id;
  END LOOP;
END $$;