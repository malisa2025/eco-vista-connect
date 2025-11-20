-- Allow job seekers to delete their own applications (for withdrawing)
CREATE POLICY "Users can withdraw their own applications"
  ON public.job_applications
  FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');