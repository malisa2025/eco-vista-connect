-- Seed ad benchmarks data for major categories and regions
INSERT INTO ad_benchmarks (category, region, avg_ctr, avg_cost_per_click, avg_conversion_rate, sample_size)
VALUES 
  -- Technology Sector
  ('Technology', 'Greater Accra', 3.5, 1.50, 2.8, 150),
  ('Technology', 'Ashanti', 3.2, 1.20, 2.5, 80),
  ('Technology', NULL, 3.4, 1.35, 2.7, 230),
  
  -- Food & Dining
  ('Food & Dining', 'Greater Accra', 4.2, 0.80, 3.5, 200),
  ('Food & Dining', 'Ashanti', 3.8, 0.70, 3.2, 120),
  ('Food & Dining', NULL, 4.0, 0.75, 3.4, 320),
  
  -- Fashion
  ('Fashion', 'Greater Accra', 3.8, 1.00, 2.9, 180),
  ('Fashion', 'Ashanti', 3.5, 0.90, 2.7, 100),
  ('Fashion', NULL, 3.7, 0.95, 2.8, 280),
  
  -- Professional Services
  ('Professional Services', 'Greater Accra', 2.9, 2.00, 4.2, 90),
  ('Professional Services', 'Ashanti', 2.6, 1.80, 3.8, 50),
  ('Professional Services', NULL, 2.8, 1.90, 4.0, 140),
  
  -- Healthcare
  ('Healthcare', 'Greater Accra', 3.3, 1.80, 4.5, 110),
  ('Healthcare', 'Ashanti', 3.0, 1.60, 4.2, 70),
  ('Healthcare', NULL, 3.2, 1.70, 4.4, 180),
  
  -- Education
  ('Education', 'Greater Accra', 3.0, 1.20, 3.8, 95),
  ('Education', 'Ashanti', 2.8, 1.00, 3.5, 60),
  ('Education', NULL, 2.9, 1.10, 3.7, 155),
  
  -- Real Estate
  ('Real Estate', 'Greater Accra', 2.5, 2.50, 5.0, 75),
  ('Real Estate', 'Ashanti', 2.2, 2.20, 4.5, 40),
  ('Real Estate', NULL, 2.4, 2.35, 4.8, 115),
  
  -- Automotive
  ('Automotive', 'Greater Accra', 2.8, 1.80, 3.2, 85),
  ('Automotive', 'Ashanti', 2.5, 1.60, 2.9, 50),
  ('Automotive', NULL, 2.7, 1.70, 3.1, 135);

-- Update timestamps
UPDATE ad_benchmarks SET updated_at = NOW();