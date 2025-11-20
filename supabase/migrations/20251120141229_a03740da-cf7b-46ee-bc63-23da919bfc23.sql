-- Add video support to businesses table
ALTER TABLE public.businesses
ADD COLUMN video_url TEXT,
ADD COLUMN video_thumbnail_url TEXT,
ADD COLUMN video_duration INTEGER; -- in seconds

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-videos',
  'business-videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Storage policies for videos
CREATE POLICY "Anyone can view business videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'business-videos');

CREATE POLICY "Business owners can upload videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'business-videos'
  AND auth.uid() IN (
    SELECT user_id FROM public.business_owners
  )
);

CREATE POLICY "Business owners can update their videos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'business-videos'
  AND auth.uid() IN (
    SELECT user_id FROM public.business_owners
  )
);

CREATE POLICY "Business owners can delete their videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'business-videos'
  AND auth.uid() IN (
    SELECT user_id FROM public.business_owners
  )
);