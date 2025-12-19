-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit a contact form
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can read submissions
CREATE POLICY "Admins can read contact submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can manage all submissions
CREATE POLICY "Admins can manage contact submissions"
  ON public.contact_submissions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));