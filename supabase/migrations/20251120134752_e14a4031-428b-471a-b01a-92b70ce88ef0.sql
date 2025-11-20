-- Create claim_status enum
CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'rejected');

-- Create claim_type enum
CREATE TYPE public.claim_type AS ENUM ('new_business', 'claim_existing');

-- Create business_claims table
CREATE TABLE public.business_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status claim_status DEFAULT 'pending' NOT NULL,
  claim_type claim_type NOT NULL,
  business_data jsonb,
  documents jsonb,
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on business_claims
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

-- Business claims RLS policies
CREATE POLICY "Users can view own claims"
  ON public.business_claims FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create claims"
  ON public.business_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update claims"
  ON public.business_claims FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create business_owners table
CREATE TABLE public.business_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_primary boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (business_id, user_id)
);

-- Enable RLS on business_owners
ALTER TABLE public.business_owners ENABLE ROW LEVEL SECURITY;

-- Business owners RLS policies
CREATE POLICY "Anyone can view business owners"
  ON public.business_owners FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage business owners"
  ON public.business_owners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle claim approval
CREATE OR REPLACE FUNCTION public.handle_claim_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- For new business claims, create the business
    IF NEW.claim_type = 'new_business' AND NEW.business_data IS NOT NULL THEN
      -- Insert new business from claim data
      INSERT INTO public.businesses (
        name, description, category, region, address,
        phone, email, website, latitude, longitude
      )
      SELECT
        (NEW.business_data->>'name')::text,
        (NEW.business_data->>'description')::text,
        (NEW.business_data->>'category')::text,
        (NEW.business_data->>'region')::text,
        (NEW.business_data->>'address')::text,
        (NEW.business_data->>'phone')::text,
        (NEW.business_data->>'email')::text,
        (NEW.business_data->>'website')::text,
        (NEW.business_data->>'latitude')::numeric,
        (NEW.business_data->>'longitude')::numeric
      RETURNING id INTO NEW.business_id;
    END IF;
    
    -- Create business_owners record
    INSERT INTO public.business_owners (business_id, user_id, is_primary)
    VALUES (NEW.business_id, NEW.user_id, true)
    ON CONFLICT (business_id, user_id) DO NOTHING;
    
    -- Assign business_owner role to user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'business_owner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for claim approval
CREATE TRIGGER on_claim_approval
  BEFORE UPDATE ON public.business_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_claim_approval();

-- Trigger to update business_claims updated_at
CREATE TRIGGER update_business_claims_updated_at
  BEFORE UPDATE ON public.business_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();