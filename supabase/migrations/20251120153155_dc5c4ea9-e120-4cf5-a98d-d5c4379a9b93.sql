-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule check-ad-alerts to run daily at 9 AM
SELECT cron.schedule(
  'check-ad-alerts-daily',
  '0 9 * * *', -- Every day at 9:00 AM
  $$
  SELECT net.http_post(
    url:='https://oxaghzctrjemldcezcqq.supabase.co/functions/v1/check-ad-alerts',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWdoemN0cmplbWxkY2V6Y3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDI4MDAsImV4cCI6MjA3OTIxODgwMH0.q_zS_7k6NUfstgYe8k3bzdUtVRzAKlhfp2UpURWP8gM"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);

-- Schedule aggregate-daily-stats to run daily at midnight
SELECT cron.schedule(
  'aggregate-daily-stats-midnight',
  '0 0 * * *', -- Every day at midnight (00:00)
  $$
  SELECT net.http_post(
    url:='https://oxaghzctrjemldcezcqq.supabase.co/functions/v1/aggregate-daily-stats',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWdoemN0cmplbWxkY2V6Y3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDI4MDAsImV4cCI6MjA3OTIxODgwMH0.q_zS_7k6NUfstgYe8k3bzdUtVRzAKlhfp2UpURWP8gM"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);