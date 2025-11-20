-- Create storage bucket for job applications
INSERT INTO storage.buckets (id, name, public) 
VALUES ('job-applications', 'job-applications', false);

-- Storage policies for job-applications bucket

-- Job seekers can upload their own videos and resumes
CREATE POLICY "Job seekers can upload application files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-applications' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Job seekers can view their own uploaded files
CREATE POLICY "Job seekers can view their files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job-applications' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Business owners can view application files for their job postings
CREATE POLICY "Business owners can view application files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job-applications' AND
  EXISTS (
    SELECT 1 FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    JOIN public.business_owners bo ON bo.business_id = j.business_id
    WHERE bo.user_id = auth.uid()
    AND ja.user_id::text = (storage.foldername(name))[1]
  )
);

-- Admins can manage all files
CREATE POLICY "Admins can manage all job application files"
ON storage.objects FOR ALL
USING (
  bucket_id = 'job-applications' AND
  has_role(auth.uid(), 'admin'::app_role)
);