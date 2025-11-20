-- Add RLS policy for admins to view all ad clicks
CREATE POLICY "Admins can view all ad clicks"
ON public.ad_clicks FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

COMMENT ON POLICY "Admins can view all ad clicks" ON public.ad_clicks IS 'Allows admin users to view all ad click data for analytics and reporting purposes';