-- Seed subscription plans for businesses and job seekers (features as jsonb)
INSERT INTO subscription_plans (name, slug, price, billing_period, target_audience, features, limits, is_active, popular, display_order)
VALUES 
  -- Free Business Plan
  (
    'Free',
    'free-business',
    0,
    'monthly',
    'business',
    '["Basic business listing", "Up to 5 gallery images", "Contact form", "2 job postings per month", "Email support"]'::jsonb,
    '{"jobs_per_month": 2, "gallery_images": 5, "video_allowed": false, "leads_dashboard": false, "ad_analytics": false}'::jsonb,
    true,
    false,
    1
  ),
  
  -- Basic Business Plan
  (
    'Basic',
    'basic-business',
    49.99,
    'monthly',
    'business',
    '["Everything in Free", "Premium badge", "Up to 15 gallery images", "5 job postings per month", "Basic ad analytics", "Ad benchmarks access", "Priority support"]'::jsonb,
    '{"jobs_per_month": 5, "gallery_images": 15, "video_allowed": true, "leads_dashboard": true, "ad_analytics_basic": true, "ad_benchmarks": true}'::jsonb,
    true,
    false,
    2
  ),
  
  -- Pro Business Plan (Most Popular)
  (
    'Pro',
    'pro-business',
    99.99,
    'monthly',
    'business',
    '["Everything in Basic", "Verified badge", "Unlimited gallery images", "20 job postings per month", "Advanced ad analytics", "A/B testing for ads", "AI-powered insights", "Lead scoring & CRM", "Resume database access", "Custom lead forms", "Priority listing", "Dedicated support"]'::jsonb,
    '{"jobs_per_month": 20, "gallery_images": -1, "video_allowed": true, "leads_dashboard": true, "ad_analytics_advanced": true, "ad_benchmarks": true, "ab_testing": true, "ai_insights": true, "ai_credits": 100, "resume_database": true}'::jsonb,
    true,
    true,
    3
  ),
  
  -- Premium Business Plan
  (
    'Premium',
    'premium-business',
    199.99,
    'monthly',
    'business',
    '["Everything in Pro", "Verified + Trusted badge", "Unlimited job postings", "Featured placement", "Sponsored listing", "Advanced A/B testing", "Custom analytics reports", "Unlimited AI credits", "White-label lead forms", "API access", "Account manager", "24/7 priority support"]'::jsonb,
    '{"jobs_per_month": -1, "gallery_images": -1, "video_allowed": true, "leads_dashboard": true, "ad_analytics_advanced": true, "ad_benchmarks": true, "ab_testing": true, "ai_insights": true, "ai_credits": -1, "resume_database": true, "api_access": true, "featured": true, "sponsored": true}'::jsonb,
    true,
    false,
    4
  ),
  
  -- Pro Job Seeker Plan
  (
    'Pro Job Seeker',
    'pro-job-seeker',
    10,
    'monthly',
    'job_seeker',
    '["Unlimited job applications", "Priority application placement", "Resume visibility boost", "Application tracking", "Job alerts", "Cover letter generator", "Interview reminders", "Salary insights"]'::jsonb,
    '{"applications_per_month": -1, "priority_placement": true, "resume_boost": true}'::jsonb,
    true,
    true,
    1
  );