-- Add flag system and admin notes to jobs table
ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add cancellation tracking to subscriptions
ALTER TABLE job_seeker_subscriptions 
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS lifetime_value NUMERIC DEFAULT 0;

-- Create index for flagged jobs
CREATE INDEX IF NOT EXISTS idx_jobs_flagged ON jobs(is_flagged) WHERE is_flagged = TRUE;

-- Create index for subscription status
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON job_seeker_subscriptions(status);

-- Create function to calculate subscription lifetime value
CREATE OR REPLACE FUNCTION calculate_subscription_lifetime_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Update lifetime value when payment is successful
  IF NEW.status = 'success' THEN
    UPDATE job_seeker_subscriptions
    SET lifetime_value = COALESCE(lifetime_value, 0) + NEW.amount
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for lifetime value calculation
DROP TRIGGER IF EXISTS update_subscription_lifetime_value ON subscription_payments;
CREATE TRIGGER update_subscription_lifetime_value
  AFTER INSERT OR UPDATE ON subscription_payments
  FOR EACH ROW
  WHEN (NEW.status = 'success')
  EXECUTE FUNCTION calculate_subscription_lifetime_value();