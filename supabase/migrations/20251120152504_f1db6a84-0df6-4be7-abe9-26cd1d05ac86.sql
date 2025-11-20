-- Create ad_impressions_daily table for aggregated metrics
CREATE TABLE IF NOT EXISTS public.ad_impressions_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertisement_id UUID NOT NULL REFERENCES public.advertisements(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(advertisement_id, date)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_ad_impressions_daily_ad_date ON public.ad_impressions_daily(advertisement_id, date DESC);

-- Enable RLS
ALTER TABLE public.ad_impressions_daily ENABLE ROW LEVEL SECURITY;

-- Policy: Business owners can view their own ad daily stats
CREATE POLICY "Business owners can view their ad daily stats"
ON public.ad_impressions_daily
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.advertisements a
    JOIN public.business_owners bo ON bo.business_id = a.business_id
    WHERE a.id = ad_impressions_daily.advertisement_id
    AND bo.user_id = auth.uid()
  )
);

-- Policy: Admins can view all daily stats
CREATE POLICY "Admins can view all daily stats"
ON public.ad_impressions_daily
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to aggregate daily stats
CREATE OR REPLACE FUNCTION public.aggregate_daily_ad_stats(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update daily aggregated stats for the target date
  INSERT INTO public.ad_impressions_daily (advertisement_id, date, impressions, clicks)
  SELECT 
    a.id as advertisement_id,
    target_date as date,
    COALESCE(a.impressions, 0) as impressions,
    (SELECT COUNT(*) FROM public.ad_clicks ac 
     WHERE ac.advertisement_id = a.id 
     AND DATE(ac.clicked_at) = target_date) as clicks
  FROM public.advertisements a
  WHERE a.status = 'active'
  ON CONFLICT (advertisement_id, date) 
  DO UPDATE SET
    impressions = EXCLUDED.impressions,
    clicks = EXCLUDED.clicks;
END;
$$;