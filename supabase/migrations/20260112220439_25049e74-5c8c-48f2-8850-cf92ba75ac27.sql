-- Create a function to update claim status with SECURITY DEFINER
-- This allows the function to bypass RLS while still checking admin role
CREATE OR REPLACE FUNCTION public.admin_update_claim_status(
  p_claim_id uuid,
  p_status claim_status,
  p_admin_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Update the claim
  UPDATE public.business_claims
  SET 
    status = p_status,
    admin_notes = p_admin_notes,
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = p_claim_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Claim not found';
  END IF;
END;
$$;