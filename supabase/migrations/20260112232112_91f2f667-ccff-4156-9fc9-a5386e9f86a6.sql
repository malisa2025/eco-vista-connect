-- Fix notify_claim_status to safely handle missing settings
CREATE OR REPLACE FUNCTION public.notify_claim_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url text;
  v_service_role_key text;
  v_user_email text;
BEGIN
  -- Only proceed if status changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Safely get settings (returns null if not set)
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Skip email if settings are not configured
  IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  IF v_user_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'to', v_user_email,
        'subject', 'Business Claim Status Update',
        'template', 'claim_status',
        'data', jsonb_build_object(
          'status', NEW.status,
          'admin_notes', NEW.admin_notes
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Fix notify_new_message to safely handle missing settings
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url text;
  v_service_role_key text;
  v_recipient_email text;
  v_sender_name text;
BEGIN
  -- Safely get settings (returns null if not set)
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Skip email if settings are not configured
  IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get recipient email
  SELECT email INTO v_recipient_email
  FROM auth.users
  WHERE id = NEW.recipient_id;

  -- Get sender name
  SELECT COALESCE(full_name, 'Someone') INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  IF v_recipient_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'to', v_recipient_email,
        'subject', 'New Message from ' || v_sender_name,
        'template', 'new_message',
        'data', jsonb_build_object(
          'sender_name', v_sender_name,
          'message_preview', LEFT(NEW.content, 100)
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Fix notify_ad_status to safely handle missing settings
CREATE OR REPLACE FUNCTION public.notify_ad_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url text;
  v_service_role_key text;
  v_user_email text;
BEGIN
  -- Only proceed if status changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Safely get settings (returns null if not set)
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Skip email if settings are not configured
  IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.business_id;

  IF v_user_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_role_key
      ),
      body := jsonb_build_object(
        'to', v_user_email,
        'subject', 'Advertisement Status Update',
        'template', 'ad_status',
        'data', jsonb_build_object(
          'ad_title', NEW.title,
          'status', NEW.status
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$;