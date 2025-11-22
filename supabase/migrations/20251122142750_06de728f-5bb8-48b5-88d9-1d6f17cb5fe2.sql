-- Fix security warnings for Phase 2 functions

-- Drop and recreate update_updated_at_column_phase2 with proper search_path
DROP FUNCTION IF EXISTS update_updated_at_column_phase2() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column_phase2()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers
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

-- Drop and recreate calculate_business_subscription_ltv with proper search_path
DROP FUNCTION IF EXISTS calculate_business_subscription_ltv() CASCADE;

CREATE OR REPLACE FUNCTION calculate_business_subscription_ltv()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    NEW.lifetime_value = COALESCE(OLD.lifetime_value, 0) + NEW.amount;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER trigger_calculate_business_subscription_ltv
BEFORE INSERT OR UPDATE ON business_subscriptions
FOR EACH ROW
EXECUTE FUNCTION calculate_business_subscription_ltv();