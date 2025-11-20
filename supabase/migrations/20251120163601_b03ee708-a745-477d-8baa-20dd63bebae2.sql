-- Add status tracking to job_applications
ALTER TABLE job_applications
ADD COLUMN status_changed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN status_changed_by UUID REFERENCES auth.users(id);

-- Create applicant_notes table
CREATE TABLE applicant_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create applicant_tags table
CREATE TABLE applicant_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(application_id, tag)
);

-- Create interview_schedule table
CREATE TABLE interview_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  interviewer_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE applicant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_schedule ENABLE ROW LEVEL SECURITY;

-- RLS policies for applicant_notes
CREATE POLICY "Business owners can view notes for their job applications"
ON applicant_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    JOIN business_owners bo ON bo.business_id = j.business_id
    WHERE ja.id = applicant_notes.application_id
    AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Business owners can create notes for their job applications"
ON applicant_notes FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    JOIN business_owners bo ON bo.business_id = j.business_id
    WHERE ja.id = applicant_notes.application_id
    AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update their own notes"
ON applicant_notes FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Business owners can delete their own notes"
ON applicant_notes FOR DELETE
USING (auth.uid() = author_id);

-- RLS policies for applicant_tags
CREATE POLICY "Business owners can view tags for their job applications"
ON applicant_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    JOIN business_owners bo ON bo.business_id = j.business_id
    WHERE ja.id = applicant_tags.application_id
    AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Business owners can create tags for their job applications"
ON applicant_tags FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    JOIN business_owners bo ON bo.business_id = j.business_id
    WHERE ja.id = applicant_tags.application_id
    AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Business owners can delete tags for their job applications"
ON applicant_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    JOIN business_owners bo ON bo.business_id = j.business_id
    WHERE ja.id = applicant_tags.application_id
    AND bo.user_id = auth.uid()
  )
);

-- RLS policies for interview_schedule
CREATE POLICY "Business owners can manage interviews for their job applications"
ON interview_schedule FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    JOIN business_owners bo ON bo.business_id = j.business_id
    WHERE ja.id = interview_schedule.application_id
    AND bo.user_id = auth.uid()
  )
);

-- Create trigger to update status_changed_at
CREATE OR REPLACE FUNCTION update_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_changed_at = now();
    NEW.status_changed_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER job_application_status_change
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_status_changed();

-- Create indexes for performance
CREATE INDEX idx_applicant_notes_application ON applicant_notes(application_id);
CREATE INDEX idx_applicant_tags_application ON applicant_tags(application_id);
CREATE INDEX idx_interview_schedule_application ON interview_schedule(application_id);
CREATE INDEX idx_interview_schedule_date ON interview_schedule(scheduled_at);