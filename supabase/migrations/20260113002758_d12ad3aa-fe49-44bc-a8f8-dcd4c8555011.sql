-- Phase 1: Fix Critical Data Exposure (SELECT Policies)

-- 1.1 Restrict profiles table visibility
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Business owners can view applicant profiles" ON profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    JOIN business_owners bo ON bo.business_id = j.business_id
    WHERE ja.user_id = profiles.id AND bo.user_id = auth.uid()
  )
);

-- 1.2 Restrict user_roles table visibility
DROP POLICY IF EXISTS "Users can view all roles" ON user_roles;

CREATE POLICY "Users can view own roles" ON user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Phase 2: Fix Analytics/Tracking INSERT Policies

-- 2.1 Fix ad_clicks
DROP POLICY IF EXISTS "Anyone can record ad clicks" ON ad_clicks;

CREATE POLICY "Anyone can record ad clicks for active ads" ON ad_clicks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM advertisements 
    WHERE id = advertisement_id AND status = 'active'
  )
);

-- 2.2 Fix ad_conversions
DROP POLICY IF EXISTS "Anyone can record conversions" ON ad_conversions;

CREATE POLICY "Anyone can record conversions for active ads" ON ad_conversions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM advertisements 
    WHERE id = advertisement_id AND status = 'active'
  )
);

-- 2.3 Fix job_views
DROP POLICY IF EXISTS "Anyone can create job views" ON job_views;

CREATE POLICY "Anyone can create job views for active jobs" ON job_views
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM jobs 
    WHERE id = job_id AND status = 'active'
  )
);

-- 2.4 Fix business_views
DROP POLICY IF EXISTS "Anyone can create views" ON business_views;

CREATE POLICY "Anyone can create views for existing businesses" ON business_views
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id
  )
);

-- Phase 3: Fix Form Submission INSERT Policies

-- 3.1 Fix business_leads
DROP POLICY IF EXISTS "Anyone can create leads" ON business_leads;

CREATE POLICY "Anyone can create leads for valid forms" ON business_leads
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lead_forms 
    WHERE id = form_id AND business_id = business_leads.business_id
  )
);

-- 3.2 Fix contact_submissions
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;

CREATE POLICY "Anyone can submit contact form with required fields" ON contact_submissions
FOR INSERT
WITH CHECK (
  email IS NOT NULL AND 
  message IS NOT NULL AND
  name IS NOT NULL
);

-- 3.3 Fix restaurant_reservations
DROP POLICY IF EXISTS "Anyone can create reservations" ON restaurant_reservations;

CREATE POLICY "Anyone can create reservations for valid restaurants" ON restaurant_reservations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id AND business_type IN ('restaurant', 'hotel')
  )
);

-- 3.4 Fix hotel_enquiries
DROP POLICY IF EXISTS "Anyone can create enquiries" ON hotel_enquiries;

CREATE POLICY "Anyone can create enquiries for valid hotels" ON hotel_enquiries
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hotel_properties 
    WHERE id = hotel_id
  )
);

-- Phase 4: Fix System Table Policies

-- 4.1 Fix subscription_usage_logs
DROP POLICY IF EXISTS "System can create usage logs" ON subscription_usage_logs;

CREATE POLICY "Admins can manage usage logs" ON subscription_usage_logs
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 4.2 Fix business_status_cache
DROP POLICY IF EXISTS "System can manage business status" ON business_status_cache;

CREATE POLICY "Admins can manage business status cache" ON business_status_cache
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));