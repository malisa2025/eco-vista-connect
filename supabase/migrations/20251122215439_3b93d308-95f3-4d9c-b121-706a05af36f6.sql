-- Function to increment subscription usage counters
CREATE OR REPLACE FUNCTION public.increment_subscription_usage(
  p_subscription_id UUID,
  p_field TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_usage JSONB;
  v_field_value INTEGER;
BEGIN
  -- Get current usage
  SELECT current_usage INTO v_current_usage
  FROM business_subscriptions
  WHERE id = p_subscription_id;
  
  -- If current_usage is null, initialize it
  IF v_current_usage IS NULL THEN
    v_current_usage = '{}'::JSONB;
  END IF;
  
  -- Get current field value, default to 0 if not exists
  v_field_value = COALESCE((v_current_usage->>p_field)::INTEGER, 0);
  
  -- Update with incremented value
  v_current_usage = jsonb_set(
    v_current_usage,
    ARRAY[p_field],
    to_jsonb(v_field_value + p_increment)
  );
  
  -- Update the subscription
  UPDATE business_subscriptions
  SET 
    current_usage = v_current_usage,
    updated_at = NOW()
  WHERE id = p_subscription_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_subscription_usage TO authenticated;

COMMENT ON FUNCTION public.increment_subscription_usage IS 'Increments usage counters in business_subscriptions.current_usage JSONB field';