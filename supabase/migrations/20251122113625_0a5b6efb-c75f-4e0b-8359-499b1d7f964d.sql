-- Fix the review analysis trigger to properly call the edge function
-- Drop the old function first
DROP FUNCTION IF EXISTS analyze_new_review() CASCADE;

-- Recreate with proper Supabase configuration
CREATE OR REPLACE FUNCTION analyze_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_url text := 'https://oxaghzctrjemldcezcqq.supabase.co';
  service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWdoemN0cmplbWxkY2V6Y3FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY0MjgwMCwiZXhwIjoyMDc5MjE4ODAwfQ.Qz7_GwdRJzT9t-FFJd-nQ2lXMYOcVDHHgY0ov9-qBxg';
BEGIN
  -- Call the edge function asynchronously to analyze the review
  PERFORM
    net.http_post(
      url := project_url || '/functions/v1/analyze-review-authenticity',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'reviewId', NEW.id,
        'reviewText', NEW.comment,
        'rating', NEW.rating,
        'userId', NEW.user_id,
        'businessId', NEW.business_id
      )
    );
  
  RETURN NEW;
END;
$$;

-- Recreate trigger on review insert
DROP TRIGGER IF EXISTS trigger_analyze_new_review ON reviews;
CREATE TRIGGER trigger_analyze_new_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION analyze_new_review();

-- Add comment for documentation
COMMENT ON FUNCTION analyze_new_review() IS 'Automatically triggers AI analysis of newly created reviews to detect authenticity using Supabase edge function';
COMMENT ON TRIGGER trigger_analyze_new_review ON reviews IS 'Calls edge function to analyze review authenticity after insert';