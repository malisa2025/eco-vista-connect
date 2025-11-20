-- Create admin statistics function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_businesses bigint,
  total_users bigint,
  total_reviews bigint,
  pending_claims bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.businesses) as total_businesses,
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.reviews) as total_reviews,
    (SELECT COUNT(*) FROM public.business_claims WHERE status = 'pending') as pending_claims;
END;
$$;

-- Create recent activity function
CREATE OR REPLACE FUNCTION public.get_recent_activity()
RETURNS TABLE (
  id uuid,
  activity_type text,
  title text,
  description text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bc.id,
    'claim'::text as activity_type,
    COALESCE(b.name, 'New Business Claim') as title,
    'Business claim submitted by ' || COALESCE(p.full_name, p.email) as description,
    bc.created_at
  FROM public.business_claims bc
  LEFT JOIN public.businesses b ON bc.business_id = b.id
  LEFT JOIN public.profiles p ON bc.user_id = p.id
  WHERE bc.status = 'pending'
  ORDER BY bc.created_at DESC
  LIMIT 10;
END;
$$;

-- Add payment fields to advertisements table
ALTER TABLE public.advertisements
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertisement_id uuid REFERENCES public.advertisements(id) ON DELETE CASCADE NOT NULL,
  payment_reference text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text DEFAULT 'paystack',
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb
);

-- Enable RLS on payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_transactions
CREATE POLICY "Users can view own payment transactions"
ON public.payment_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.advertisements a
    JOIN public.business_owners bo ON bo.business_id = a.business_id
    WHERE a.id = payment_transactions.advertisement_id
    AND bo.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all payment transactions"
ON public.payment_transactions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger to update payment_transactions updated_at
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();