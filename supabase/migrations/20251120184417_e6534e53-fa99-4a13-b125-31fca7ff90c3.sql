-- Create email_preferences table
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_notifications BOOLEAN DEFAULT true,
  job_alert_emails BOOLEAN DEFAULT true,
  interview_reminders BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT true,
  digest_emails BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_preferences
CREATE POLICY "Users can view own email preferences"
  ON public.email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON public.email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON public.email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_id_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Trigger to update updated_at on email_preferences
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default email preferences on user signup
CREATE OR REPLACE FUNCTION public.create_default_email_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create default email preferences for new users
CREATE TRIGGER on_auth_user_created_email_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_email_preferences();

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger to notify on application status change
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_record RECORD;
  v_business_record RECORD;
  v_applicant_profile RECORD;
BEGIN
  -- Only proceed if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get job and business details
    SELECT j.*, b.name as business_name INTO v_job_record
    FROM public.jobs j
    JOIN public.businesses b ON b.id = j.business_id
    WHERE j.id = NEW.job_id;
    
    -- Get applicant profile
    SELECT * INTO v_applicant_profile
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Create in-app notification for applicant
    PERFORM create_notification(
      NEW.user_id,
      'application_status',
      'Application Status Updated',
      'Your application for ' || v_job_record.title || ' at ' || v_job_record.business_name || ' has been updated to: ' || NEW.status,
      '/my-applications'
    );
    
    -- Check email preferences and send email
    IF EXISTS (
      SELECT 1 FROM public.email_preferences
      WHERE user_id = NEW.user_id
      AND application_notifications = true
    ) THEN
      -- Call edge function to send email
      PERFORM
        net.http_post(
          url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := jsonb_build_object(
            'type', 'application_status_update',
            'to', v_applicant_profile.email,
            'data', jsonb_build_object(
              'applicant_name', COALESCE(v_applicant_profile.full_name, 'Job Seeker'),
              'job_title', v_job_record.title,
              'company_name', v_job_record.business_name,
              'status', NEW.status,
              'notes', NEW.notes
            )
          )
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for application status changes
DROP TRIGGER IF EXISTS on_application_status_change ON public.job_applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_status_change();

-- Trigger to notify employer of new application
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_record RECORD;
  v_business_record RECORD;
  v_applicant_profile RECORD;
  v_employer_profile RECORD;
BEGIN
  -- Get job and business details
  SELECT j.*, b.name as business_name INTO v_job_record
  FROM public.jobs j
  JOIN public.businesses b ON b.id = j.business_id
  WHERE j.id = NEW.job_id;
  
  -- Get applicant profile
  SELECT * INTO v_applicant_profile
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Get primary business owner (employer)
  SELECT p.* INTO v_employer_profile
  FROM public.profiles p
  JOIN public.business_owners bo ON bo.user_id = p.id
  WHERE bo.business_id = v_job_record.business_id
  AND bo.is_primary = true
  LIMIT 1;
  
  -- Create in-app notification for employer
  IF v_employer_profile.id IS NOT NULL THEN
    PERFORM create_notification(
      v_employer_profile.id,
      'new_application',
      'New Job Application',
      COALESCE(v_applicant_profile.full_name, 'Someone') || ' applied for ' || v_job_record.title,
      '/jobs/applications/' || NEW.job_id
    );
    
    -- Check email preferences and send email
    IF EXISTS (
      SELECT 1 FROM public.email_preferences
      WHERE user_id = v_employer_profile.id
      AND application_notifications = true
    ) THEN
      PERFORM
        net.http_post(
          url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := jsonb_build_object(
            'type', 'job_application_received',
            'to', v_employer_profile.email,
            'data', jsonb_build_object(
              'employer_name', COALESCE(v_employer_profile.full_name, 'Employer'),
              'job_title', v_job_record.title,
              'applicant_name', COALESCE(v_applicant_profile.full_name, 'Job Seeker'),
              'applied_date', to_char(NEW.applied_at, 'Mon DD, YYYY'),
              'has_video', NEW.video_url IS NOT NULL,
              'job_id', NEW.job_id
            )
          )
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new applications
DROP TRIGGER IF EXISTS on_new_application ON public.job_applications;
CREATE TRIGGER on_new_application
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_application();