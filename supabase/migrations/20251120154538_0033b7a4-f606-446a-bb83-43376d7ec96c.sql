-- Create enums for job-related types
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'executive');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'expired');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');

-- Create jobs table
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  requirements text,
  responsibilities text,
  location text,
  job_type job_type NOT NULL,
  salary_range text,
  experience_level experience_level NOT NULL,
  category text NOT NULL,
  require_video boolean DEFAULT false,
  video_prompt text,
  status job_status DEFAULT 'draft'::job_status,
  applications_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  posted_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  cover_letter text NOT NULL,
  video_url text,
  resume_url text,
  status application_status DEFAULT 'pending'::application_status,
  applied_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  notes text,
  UNIQUE(job_id, user_id)
);

-- Create job_seeker_subscriptions table
CREATE TABLE public.job_seeker_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  status subscription_status DEFAULT 'active'::subscription_status,
  payment_reference text,
  amount numeric NOT NULL DEFAULT 10,
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  payment_method text DEFAULT 'paystack',
  auto_renew boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create subscription_payments table
CREATE TABLE public.subscription_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id uuid REFERENCES public.job_seeker_subscriptions(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  payment_reference text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'paystack',
  paid_at timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_seeker_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs table
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs FOR SELECT
  USING (status = 'active'::job_status);

CREATE POLICY "Business owners can view their jobs"
  ON public.jobs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.business_owners WHERE business_id = jobs.business_id
    )
  );

CREATE POLICY "Business owners can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.business_owners WHERE business_id = jobs.business_id
    )
  );

CREATE POLICY "Business owners can update their jobs"
  ON public.jobs FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.business_owners WHERE business_id = jobs.business_id
    )
  );

CREATE POLICY "Business owners can delete their jobs"
  ON public.jobs FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.business_owners WHERE business_id = jobs.business_id
    )
  );

CREATE POLICY "Admins can manage all jobs"
  ON public.jobs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for job_applications table
CREATE POLICY "Job seekers can view their applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Business owners can view applications for their jobs"
  ON public.job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.business_owners bo ON bo.business_id = j.business_id
      WHERE j.id = job_applications.job_id AND bo.user_id = auth.uid()
    )
  );

CREATE POLICY "Subscribed job seekers can create applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.job_seeker_subscriptions
      WHERE user_id = auth.uid() 
      AND status = 'active'::subscription_status 
      AND end_date > now()
    )
  );

CREATE POLICY "Business owners can update application status"
  ON public.job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.business_owners bo ON bo.business_id = j.business_id
      WHERE j.id = job_applications.job_id AND bo.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all applications"
  ON public.job_applications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for job_seeker_subscriptions table
CREATE POLICY "Users can view their subscription"
  ON public.job_seeker_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscription"
  ON public.job_seeker_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subscription"
  ON public.job_seeker_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON public.job_seeker_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for subscription_payments table
CREATE POLICY "Users can view their payments"
  ON public.subscription_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
  ON public.subscription_payments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function: Check if user has active subscription
CREATE OR REPLACE FUNCTION public.check_job_seeker_subscription(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_seeker_subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'::subscription_status
    AND end_date > now()
  );
$$;

-- Function: Update applications count on jobs
CREATE OR REPLACE FUNCTION public.update_applications_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs
  SET applications_count = (
    SELECT COUNT(*) FROM public.job_applications
    WHERE job_id = NEW.job_id
  )
  WHERE id = NEW.job_id;
  
  RETURN NEW;
END;
$$;

-- Trigger: Update applications count when new application is created
CREATE TRIGGER on_application_created
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_applications_count();

-- Function: Expire old jobs
CREATE OR REPLACE FUNCTION public.expire_old_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs
  SET status = 'expired'::job_status
  WHERE status = 'active'::job_status
  AND expires_at < now();
END;
$$;

-- Function: Update job updated_at timestamp
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Update subscription updated_at timestamp
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.job_seeker_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Schedule expire_old_jobs to run daily at 1 AM
SELECT cron.schedule(
  'expire-old-jobs-daily',
  '0 1 * * *',
  $$SELECT public.expire_old_jobs();$$
);

-- Create indexes for performance
CREATE INDEX idx_jobs_business_id ON public.jobs(business_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_subscriptions_user_id ON public.job_seeker_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.job_seeker_subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON public.job_seeker_subscriptions(end_date);