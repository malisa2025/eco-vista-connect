-- Create trigger to automatically analyze new reviews for authenticity
CREATE OR REPLACE FUNCTION analyze_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function asynchronously to analyze the review
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/analyze-review-authenticity',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
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

-- Create trigger on review insert
DROP TRIGGER IF EXISTS trigger_analyze_new_review ON reviews;
CREATE TRIGGER trigger_analyze_new_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION analyze_new_review();

-- Add comment for documentation
COMMENT ON FUNCTION analyze_new_review() IS 'Automatically triggers AI analysis of newly created reviews to detect authenticity';
COMMENT ON TRIGGER trigger_analyze_new_review ON reviews IS 'Calls edge function to analyze review authenticity after insert';