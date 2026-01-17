-- Drop the overly restrictive policy that requires form_id
DROP POLICY IF EXISTS "Anyone can create leads for valid forms" ON business_leads;

-- Create a new policy that allows leads with OR without a form_id
-- If form_id is provided, it must match a valid form
-- If form_id is NULL, allow direct submission to any business
CREATE POLICY "Anyone can create leads for businesses" ON business_leads
FOR INSERT
WITH CHECK (
  -- Either no form_id (direct submission to a valid business)
  (form_id IS NULL AND EXISTS (
    SELECT 1 FROM businesses WHERE id = business_leads.business_id
  ))
  OR
  -- Or valid form_id matching the business
  (form_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM lead_forms 
    WHERE id = form_id AND business_id = business_leads.business_id
  ))
);