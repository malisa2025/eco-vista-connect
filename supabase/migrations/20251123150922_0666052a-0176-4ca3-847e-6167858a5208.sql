-- Add reservation fee configuration to hotel_properties
ALTER TABLE hotel_properties 
ADD COLUMN IF NOT EXISTS reservation_fee_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reservation_fee_percentage NUMERIC DEFAULT 20 CHECK (reservation_fee_percentage BETWEEN 1 AND 100),
ADD COLUMN IF NOT EXISTS reservation_fee_type TEXT DEFAULT 'percentage' CHECK (reservation_fee_type IN ('percentage', 'fixed')),
ADD COLUMN IF NOT EXISTS reservation_fee_fixed_amount NUMERIC DEFAULT 0;

-- Add payment breakdown tracking to hotel_bookings
ALTER TABLE hotel_bookings
ADD COLUMN IF NOT EXISTS reservation_fee_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS balance_paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS balance_payment_reference TEXT;

-- Create function to calculate reservation fee
CREATE OR REPLACE FUNCTION calculate_reservation_fee(
  p_hotel_id UUID,
  p_total_price NUMERIC
)
RETURNS TABLE (
  reservation_fee NUMERIC,
  balance_due NUMERIC,
  fee_enabled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fee_enabled BOOLEAN;
  v_fee_type TEXT;
  v_fee_percentage NUMERIC;
  v_fee_fixed NUMERIC;
  v_reservation_fee NUMERIC;
BEGIN
  SELECT 
    COALESCE(reservation_fee_enabled, false),
    COALESCE(reservation_fee_type, 'percentage'),
    COALESCE(reservation_fee_percentage, 20),
    COALESCE(reservation_fee_fixed_amount, 0)
  INTO v_fee_enabled, v_fee_type, v_fee_percentage, v_fee_fixed
  FROM hotel_properties
  WHERE id = p_hotel_id;
  
  IF NOT v_fee_enabled THEN
    -- Full payment required
    RETURN QUERY SELECT p_total_price, 0::NUMERIC, false;
  ELSE
    IF v_fee_type = 'percentage' THEN
      v_reservation_fee := ROUND(p_total_price * (v_fee_percentage / 100), 2);
    ELSE
      v_reservation_fee := v_fee_fixed;
    END IF;
    
    -- Ensure reservation fee doesn't exceed total and is at least 0
    v_reservation_fee := LEAST(GREATEST(v_reservation_fee, 0), p_total_price);
    
    RETURN QUERY SELECT v_reservation_fee, (p_total_price - v_reservation_fee), true;
  END IF;
END;
$$;