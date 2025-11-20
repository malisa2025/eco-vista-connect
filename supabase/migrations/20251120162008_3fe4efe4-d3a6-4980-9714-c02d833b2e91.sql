-- Track individual job views with metadata for analytics
CREATE TABLE IF NOT EXISTS job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'direct', 'search', 'referral', 'social'
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  session_id TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_viewed_at ON job_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_job_views_source ON job_views(source);

-- Cache computed performance metrics for jobs
CREATE TABLE IF NOT EXISTS job_performance_cache (
  job_id UUID PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  visibility_score INTEGER DEFAULT 0, -- 0-100
  engagement_score INTEGER DEFAULT 0,
  conversion_score INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  recommendations JSONB,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Add quality scoring to applications
ALTER TABLE job_applications 
  ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS application_duration INTEGER, -- seconds spent on application
  ADD COLUMN IF NOT EXISTS device_type TEXT;

-- Function to calculate application quality score
CREATE OR REPLACE FUNCTION calculate_application_quality()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quality_score := 
    CASE WHEN NEW.resume_url IS NOT NULL THEN 25 ELSE 0 END +
    CASE WHEN NEW.video_url IS NOT NULL THEN 25 ELSE 0 END +
    CASE WHEN LENGTH(NEW.cover_letter) > 200 THEN 50 
         WHEN LENGTH(NEW.cover_letter) > 100 THEN 30
         ELSE 10 
    END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to set quality score on insert/update
DROP TRIGGER IF EXISTS set_application_quality ON job_applications;
CREATE TRIGGER set_application_quality
  BEFORE INSERT OR UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION calculate_application_quality();

-- Function to calculate job performance scores
CREATE OR REPLACE FUNCTION calculate_job_performance(p_job_id UUID)
RETURNS VOID AS $$
DECLARE
  v_views INTEGER;
  v_applications INTEGER;
  v_conversion DECIMAL;
  v_engagement DECIMAL;
  v_visibility INTEGER;
  v_quality DECIMAL;
  v_days_active INTEGER;
BEGIN
  -- Get view count from job_views table
  SELECT COUNT(*) INTO v_views
  FROM job_views
  WHERE job_id = p_job_id;
  
  -- Get application count
  SELECT COUNT(*) INTO v_applications
  FROM job_applications
  WHERE job_id = p_job_id;
  
  -- Get days active
  SELECT EXTRACT(DAY FROM (NOW() - posted_at))::INTEGER
  INTO v_days_active
  FROM jobs
  WHERE id = p_job_id;
  
  -- Calculate visibility score (0-100)
  -- Good performance: 50+ views in first 7 days
  v_visibility := CASE 
    WHEN v_days_active > 0 THEN LEAST(100, ((v_views::DECIMAL / v_days_active) * 7 / 50 * 100)::INTEGER)
    ELSE LEAST(100, (v_views / 5) * 10)
  END;
  
  -- Calculate conversion rate
  v_conversion := CASE 
    WHEN v_views > 0 THEN (v_applications::DECIMAL / v_views * 100)
    ELSE 0
  END;
  
  -- Calculate engagement score (0-100)
  -- Good conversion: 5-10%
  v_engagement := LEAST(100, (v_conversion / 10 * 100)::INTEGER);
  
  -- Calculate average quality of applications
  SELECT COALESCE(AVG(quality_score), 0)
  INTO v_quality
  FROM job_applications
  WHERE job_id = p_job_id;
  
  -- Insert or update cache
  INSERT INTO job_performance_cache (
    job_id,
    visibility_score,
    engagement_score,
    conversion_score,
    quality_score,
    overall_score
  ) VALUES (
    p_job_id,
    v_visibility,
    v_engagement,
    ROUND(v_conversion),
    ROUND(v_quality),
    ROUND((v_visibility * 0.25 + v_engagement * 0.4 + v_quality * 0.35))
  )
  ON CONFLICT (job_id) DO UPDATE SET
    visibility_score = EXCLUDED.visibility_score,
    engagement_score = EXCLUDED.engagement_score,
    conversion_score = EXCLUDED.conversion_score,
    quality_score = EXCLUDED.quality_score,
    overall_score = EXCLUDED.overall_score,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update performance after new application
CREATE OR REPLACE FUNCTION update_job_performance_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_job_performance(NEW.job_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_performance_on_application ON job_applications;
CREATE TRIGGER update_performance_on_application
  AFTER INSERT OR UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_performance_trigger();

-- RLS policies for job_views
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create job views"
  ON job_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Business owners can view their job views"
  ON job_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN business_owners bo ON bo.business_id = j.business_id
      WHERE j.id = job_views.job_id AND bo.user_id = auth.uid()
    )
  );

-- RLS policies for job_performance_cache
ALTER TABLE job_performance_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their job performance"
  ON job_performance_cache FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN business_owners bo ON bo.business_id = j.business_id
      WHERE j.id = job_performance_cache.job_id AND bo.user_id = auth.uid()
    )
  );