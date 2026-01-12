-- Drop and recreate the function without using has_role
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
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if user is admin directly from user_roles table
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
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