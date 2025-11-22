-- Phase 2: Revenue Maximization - Complete Database Schema

-- ============================================================================
-- FEATURE 1: ADVANCED AD PERFORMANCE DASHBOARD
-- ============================================================================

-- A/B Test Variants
CREATE TABLE ad_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertisement_id UUID REFERENCES advertisements NOT NULL,
  variant_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cta_text TEXT,
  traffic_allocation INTEGER DEFAULT 50 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 100),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion Tracking
CREATE TABLE ad_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertisement_id UUID REFERENCES advertisements NOT NULL,
  variant_id UUID REFERENCES ad_variants,
  conversion_type TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Industry Benchmarks
CREATE TABLE ad_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  region TEXT,
  avg_ctr NUMERIC DEFAULT 0,
  avg_cost_per_click NUMERIC DEFAULT 0,
  avg_conversion_rate NUMERIC DEFAULT 0,
  sample_size INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROI Tracking
CREATE TABLE ad_roi_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertisement_id UUID REFERENCES advertisements NOT NULL,
  date DATE NOT NULL,
  total_spend NUMERIC DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  roi_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advertisement_id, date)
);

-- ============================================================================
-- FEATURE 2: LEAD GENERATION & CRM TOOLS
-- ============================================================================

-- Lead Capture Forms Configuration
CREATE TABLE lead_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL,
  success_message TEXT DEFAULT 'Thank you! We will contact you soon.',
  redirect_url TEXT,
  email_notifications BOOLEAN DEFAULT true,
  notification_emails TEXT[],
  spam_protection BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  form_type TEXT DEFAULT 'contact',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Database
CREATE TABLE business_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses NOT NULL,
  form_id UUID REFERENCES lead_forms,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT,
  source TEXT DEFAULT 'direct',
  status TEXT DEFAULT 'new',
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  assigned_to UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Activities Timeline
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES business_leads NOT NULL,
  activity_type TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Response Templates
CREATE TABLE lead_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses NOT NULL,
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  template_type TEXT DEFAULT 'email',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FEATURE 3: ENHANCED SUBSCRIPTION MARKETPLACE
-- ============================================================================

-- Subscription Plans Catalog
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  target_audience TEXT NOT NULL,
  price NUMERIC NOT NULL,
  billing_period TEXT NOT NULL,
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  discount_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Subscriptions
CREATE TABLE business_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses NOT NULL,
  plan_id UUID REFERENCES subscription_plans NOT NULL,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  payment_reference TEXT,
  payment_method TEXT DEFAULT 'paystack',
  auto_renew BOOLEAN DEFAULT true,
  amount NUMERIC NOT NULL,
  current_usage JSONB DEFAULT '{}',
  lifetime_value NUMERIC DEFAULT 0,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Usage Logs
CREATE TABLE subscription_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL,
  subscription_type TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Invoices
CREATE TABLE subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL,
  subscription_type TEXT NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo Codes
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  target_plans UUID[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- QUICK WINS: Business Premium Features
-- ============================================================================

-- Add premium and sponsored fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsored_until TIMESTAMPTZ;

-- Job boosting fields
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS boost_payment_reference TEXT;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Ad Variants Policies
ALTER TABLE ad_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage their ad variants"
ON ad_variants FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM advertisements a
    JOIN business_owners bo ON bo.business_id = a.business_id
    WHERE a.id = ad_variants.advertisement_id AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all ad variants"
ON ad_variants FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Ad Conversions Policies
ALTER TABLE ad_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record conversions"
ON ad_conversions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Business owners can view their ad conversions"
ON ad_conversions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM advertisements a
    JOIN business_owners bo ON bo.business_id = a.business_id
    WHERE a.id = ad_conversions.advertisement_id AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all conversions"
ON ad_conversions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Ad Benchmarks Policies
ALTER TABLE ad_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view benchmarks"
ON ad_benchmarks FOR SELECT
USING (true);

CREATE POLICY "Admins can manage benchmarks"
ON ad_benchmarks FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Ad ROI Tracking Policies
ALTER TABLE ad_roi_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their ROI"
ON ad_roi_tracking FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM advertisements a
    JOIN business_owners bo ON bo.business_id = a.business_id
    WHERE a.id = ad_roi_tracking.advertisement_id AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all ROI data"
ON ad_roi_tracking FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Lead Forms Policies
ALTER TABLE lead_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage their lead forms"
ON lead_forms FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM business_owners
    WHERE business_id = lead_forms.business_id AND user_id = auth.uid()
  )
);

-- Business Leads Policies
ALTER TABLE business_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create leads"
ON business_leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Business owners can view their leads"
ON business_leads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM business_owners
    WHERE business_id = business_leads.business_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update their leads"
ON business_leads FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM business_owners
    WHERE business_id = business_leads.business_id AND user_id = auth.uid()
  )
);

-- Lead Activities Policies
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage lead activities"
ON lead_activities FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM business_leads bl
    JOIN business_owners bo ON bo.business_id = bl.business_id
    WHERE bl.id = lead_activities.lead_id AND bo.user_id = auth.uid()
  )
);

-- Lead Response Templates Policies
ALTER TABLE lead_response_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage their templates"
ON lead_response_templates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM business_owners
    WHERE business_id = lead_response_templates.business_id AND user_id = auth.uid()
  )
);

-- Subscription Plans Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
ON subscription_plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage plans"
ON subscription_plans FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Business Subscriptions Policies
ALTER TABLE business_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their subscriptions"
ON business_subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM business_owners
    WHERE business_id = business_subscriptions.business_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Business owners can create subscriptions"
ON business_subscriptions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM business_owners
    WHERE business_id = business_subscriptions.business_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update their subscriptions"
ON business_subscriptions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM business_owners
    WHERE business_id = business_subscriptions.business_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all business subscriptions"
ON business_subscriptions FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Subscription Usage Logs Policies
ALTER TABLE subscription_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can create usage logs"
ON subscription_usage_logs FOR INSERT
WITH CHECK (true);

-- Subscription Invoices Policies
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their invoices"
ON subscription_invoices FOR SELECT
USING (
  (subscription_type = 'job_seeker' AND subscription_id IN (
    SELECT id FROM job_seeker_subscriptions WHERE user_id = auth.uid()
  ))
  OR
  (subscription_type = 'business' AND subscription_id IN (
    SELECT bs.id FROM business_subscriptions bs
    JOIN business_owners bo ON bo.business_id = bs.business_id
    WHERE bo.user_id = auth.uid()
  ))
);

CREATE POLICY "Admins can manage all invoices"
ON subscription_invoices FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Promo Codes Policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo codes"
ON promo_codes FOR SELECT
USING (is_active = true AND valid_until > NOW());

CREATE POLICY "Admins can manage promo codes"
ON promo_codes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_ad_variants_advertisement ON ad_variants(advertisement_id);
CREATE INDEX idx_ad_conversions_advertisement ON ad_conversions(advertisement_id);
CREATE INDEX idx_ad_conversions_variant ON ad_conversions(variant_id);
CREATE INDEX idx_ad_roi_tracking_ad_date ON ad_roi_tracking(advertisement_id, date);

CREATE INDEX idx_lead_forms_business ON lead_forms(business_id);
CREATE INDEX idx_business_leads_business ON business_leads(business_id);
CREATE INDEX idx_business_leads_status ON business_leads(status);
CREATE INDEX idx_business_leads_created ON business_leads(created_at DESC);
CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);

CREATE INDEX idx_business_subscriptions_business ON business_subscriptions(business_id);
CREATE INDEX idx_business_subscriptions_status ON business_subscriptions(status);
CREATE INDEX idx_subscription_usage_logs_subscription ON subscription_usage_logs(subscription_id);
CREATE INDEX idx_subscription_invoices_subscription ON subscription_invoices(subscription_id);

CREATE INDEX idx_businesses_premium ON businesses(is_premium) WHERE is_premium = true;
CREATE INDEX idx_businesses_sponsored ON businesses(is_sponsored) WHERE is_sponsored = true;
CREATE INDEX idx_jobs_boosted ON jobs(is_boosted) WHERE is_boosted = true;

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column_phase2()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_forms_updated_at
BEFORE UPDATE ON lead_forms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column_phase2();

CREATE TRIGGER update_business_leads_updated_at
BEFORE UPDATE ON business_leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column_phase2();

CREATE TRIGGER update_business_subscriptions_updated_at
BEFORE UPDATE ON business_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column_phase2();

-- Calculate lifetime value for business subscriptions
CREATE OR REPLACE FUNCTION calculate_business_subscription_ltv()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    NEW.lifetime_value = COALESCE(OLD.lifetime_value, 0) + NEW.amount;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_business_subscription_ltv
BEFORE INSERT OR UPDATE ON business_subscriptions
FOR EACH ROW
EXECUTE FUNCTION calculate_business_subscription_ltv();

-- Check subscription feature limits
CREATE OR REPLACE FUNCTION check_business_subscription(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_subscriptions
    WHERE business_id = p_business_id
    AND status = 'active'
    AND end_date > NOW()
  );
$$;