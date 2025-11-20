-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_jobs
CREATE POLICY "Users can view their saved jobs"
  ON public.saved_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON public.saved_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave jobs"
  ON public.saved_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Create job_alerts table
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT,
  category TEXT,
  location TEXT,
  job_type TEXT,
  experience_level TEXT,
  frequency TEXT DEFAULT 'daily', -- daily, weekly, instant
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_alerts
CREATE POLICY "Users can view their job alerts"
  ON public.job_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create job alerts"
  ON public.job_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their job alerts"
  ON public.job_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their job alerts"
  ON public.job_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Add job seeker fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS preferred_job_types TEXT[],
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[],
ADD COLUMN IF NOT EXISTS salary_expectation TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'immediate';

-- Create index for faster job searches
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON public.saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_user ON public.job_alerts(user_id);

-- Trigger for job_alerts updated_at
CREATE TRIGGER update_job_alerts_updated_at
  BEFORE UPDATE ON public.job_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();