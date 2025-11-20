import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing job alerts...");

    // Get all active job alerts that need to be processed
    const { data: alerts, error: alertsError } = await supabase
      .from("job_alerts")
      .select("*")
      .eq("is_active", true)
      .or(`last_sent_at.is.null,last_sent_at.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);

    if (alertsError) throw alertsError;

    console.log(`Found ${alerts?.length || 0} alerts to process`);

    for (const alert of alerts || []) {
      try {
        // Get user email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", alert.user_id)
          .single();

        if (!profile?.email) continue;

        // Check email preferences
        const { data: emailPrefs } = await supabase
          .from("email_preferences")
          .select("job_alert_emails")
          .eq("user_id", alert.user_id)
          .single();

        if (emailPrefs && !emailPrefs.job_alert_emails) continue;

        // Build query for matching jobs
        let query = supabase
          .from("jobs")
          .select("*, businesses(name, logo_url)")
          .eq("status", "active");

        // Apply filters
        if (alert.category) {
          query = query.eq("category", alert.category);
        }
        if (alert.location) {
          query = query.ilike("location", `%${alert.location}%`);
        }
        if (alert.job_type) {
          query = query.eq("job_type", alert.job_type);
        }
        if (alert.experience_level) {
          query = query.eq("experience_level", alert.experience_level);
        }
        if (alert.keywords) {
          query = query.or(
            `title.ilike.%${alert.keywords}%,description.ilike.%${alert.keywords}%`
          );
        }

        // Get jobs posted since last alert
        const lastSent = alert.last_sent_at || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("posted_at", lastSent);

        const { data: matchingJobs, error: jobsError } = await query.limit(10);

        if (jobsError) throw jobsError;

        if (matchingJobs && matchingJobs.length > 0) {
          console.log(`Found ${matchingJobs.length} matching jobs for alert ${alert.id}`);

          // Send email with matching jobs
          await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              type: "job_alert_digest",
              to: profile.email,
              data: {
                user_name: profile.full_name || "Job Seeker",
                alert_name: alert.name,
                jobs_count: matchingJobs.length,
                jobs: matchingJobs.map((job: any) => ({
                  title: job.title,
                  company: job.businesses?.name || "Company",
                  location: job.location || "Remote",
                  job_type: job.job_type,
                  salary: job.salary_range,
                  url: `${supabaseUrl.replace('https://', 'https://app.')}/jobs/${job.id}`,
                })),
              },
            }),
          });

          // Update last_sent_at
          await supabase
            .from("job_alerts")
            .update({ last_sent_at: new Date().toISOString() })
            .eq("id", alert.id);
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: alerts?.length || 0 }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error processing job alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
