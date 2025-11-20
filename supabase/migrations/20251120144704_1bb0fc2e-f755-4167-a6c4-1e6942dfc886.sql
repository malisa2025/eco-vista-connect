-- Create function to trigger email notifications for new messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_record RECORD;
  v_sender_profile RECORD;
  v_recipient_profile RECORD;
  v_business_record RECORD;
BEGIN
  -- Get conversation details
  SELECT * INTO v_conversation_record
  FROM public.conversations
  WHERE id = NEW.conversation_id;
  
  -- Get sender profile
  SELECT * INTO v_sender_profile
  FROM public.profiles
  WHERE id = NEW.sender_id;
  
  -- Get business details
  SELECT * INTO v_business_record
  FROM public.businesses
  WHERE id = v_conversation_record.business_id;
  
  -- Determine recipient (if sender is user, notify business owner; if sender is business owner, notify user)
  IF NEW.sender_id = v_conversation_record.user_id THEN
    -- Sender is the user, notify business owner
    SELECT p.* INTO v_recipient_profile
    FROM public.profiles p
    JOIN public.business_owners bo ON bo.user_id = p.id
    WHERE bo.business_id = v_conversation_record.business_id
    AND bo.is_primary = true
    LIMIT 1;
  ELSE
    -- Sender is business owner, notify user
    SELECT * INTO v_recipient_profile
    FROM public.profiles
    WHERE id = v_conversation_record.user_id;
  END IF;
  
  -- Call edge function to send email (async, won't block)
  IF v_recipient_profile.email IS NOT NULL THEN
    PERFORM
      net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'type', 'new_message',
          'to', v_recipient_profile.email,
          'data', jsonb_build_object(
            'recipient_name', COALESCE(v_recipient_profile.full_name, 'User'),
            'sender_name', COALESCE(v_sender_profile.full_name, 'Someone'),
            'business_name', v_business_record.name,
            'message_preview', LEFT(NEW.content, 100)
          )
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS send_message_notification ON public.messages;
CREATE TRIGGER send_message_notification
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

-- Create function to notify claim status changes
CREATE OR REPLACE FUNCTION public.notify_claim_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_record RECORD;
  v_business_record RECORD;
BEGIN
  -- Only notify on status changes to approved or rejected
  IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
    -- Get user profile
    SELECT * INTO v_profile_record
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Get business details if available
    IF NEW.business_id IS NOT NULL THEN
      SELECT * INTO v_business_record
      FROM public.businesses
      WHERE id = NEW.business_id;
    END IF;
    
    -- Send notification email
    IF v_profile_record.email IS NOT NULL THEN
      PERFORM
        net.http_post(
          url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := jsonb_build_object(
            'type', CASE 
              WHEN NEW.status = 'approved' THEN 'claim_approved'
              ELSE 'claim_rejected'
            END,
            'to', v_profile_record.email,
            'data', jsonb_build_object(
              'user_name', COALESCE(v_profile_record.full_name, 'User'),
              'business_name', COALESCE(v_business_record.name, NEW.business_data->>'name', 'Business'),
              'admin_notes', NEW.admin_notes
            )
          )
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for claim status changes
DROP TRIGGER IF EXISTS send_claim_status_email ON public.business_claims;
CREATE TRIGGER send_claim_status_email
AFTER UPDATE ON public.business_claims
FOR EACH ROW
EXECUTE FUNCTION public.notify_claim_status();

-- Create function to notify advertisement status changes
CREATE OR REPLACE FUNCTION public.notify_ad_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_record RECORD;
  v_business_record RECORD;
BEGIN
  -- Only notify on status changes
  IF NEW.status != OLD.status THEN
    -- Get business owner profile
    SELECT p.* INTO v_profile_record
    FROM public.profiles p
    JOIN public.business_owners bo ON bo.user_id = p.id
    WHERE bo.business_id = NEW.business_id
    AND bo.is_primary = true
    LIMIT 1;
    
    -- Get business details
    SELECT * INTO v_business_record
    FROM public.businesses
    WHERE id = NEW.business_id;
    
    -- Send notification email
    IF v_profile_record.email IS NOT NULL THEN
      PERFORM
        net.http_post(
          url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := jsonb_build_object(
            'type', 'ad_status_update',
            'to', v_profile_record.email,
            'data', jsonb_build_object(
              'user_name', COALESCE(v_profile_record.full_name, 'Business Owner'),
              'ad_title', NEW.title,
              'business_name', v_business_record.name,
              'old_status', OLD.status,
              'new_status', NEW.status
            )
          )
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for advertisement status changes
DROP TRIGGER IF EXISTS send_ad_status_email ON public.advertisements;
CREATE TRIGGER send_ad_status_email
AFTER UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.notify_ad_status();