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

    console.log("Checking for upcoming interviews...");

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get interviews scheduled in the next 24 hours
    const { data: interviews, error: interviewsError } = await supabase
      .from("interview_schedule")
      .select(`
        *,
        job_applications(
          user_id,
          job_id,
          jobs(
            title,
            business_id,
            businesses(name)
          )
        )
      `)
      .eq("status", "scheduled")
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", in24Hours.toISOString());

    if (interviewsError) throw interviewsError;

    console.log(`Found ${interviews?.length || 0} upcoming interviews`);

    for (const interview of interviews || []) {
      try {
        const application = interview.job_applications as any;
        const job = application?.jobs;
        const business = job?.businesses;

        // Get applicant profile
        const { data: applicantProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", application.user_id)
          .single();

        // Get interviewer profile
        const { data: interviewerProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", interview.interviewer_id)
          .single();

        if (!applicantProfile?.email || !interviewerProfile?.email) continue;

        // Check email preferences for applicant
        const { data: applicantPrefs } = await supabase
          .from("email_preferences")
          .select("interview_reminders")
          .eq("user_id", application.user_id)
          .single();

        // Check email preferences for interviewer
        const { data: interviewerPrefs } = await supabase
          .from("email_preferences")
          .select("interview_reminders")
          .eq("user_id", interview.interviewer_id)
          .single();

        const interviewData = {
          job_title: job?.title || "Position",
          company_name: business?.name || "Company",
          scheduled_time: new Date(interview.scheduled_at).toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          duration: interview.duration_minutes || 60,
          location: interview.location || "To be confirmed",
          meeting_link: interview.meeting_link,
          notes: interview.notes,
        };

        // Send reminder to applicant
        if (!applicantPrefs || applicantPrefs.interview_reminders) {
          await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              type: "interview_reminder",
              to: applicantProfile.email,
              data: {
                user_name: applicantProfile.full_name || "Job Seeker",
                user_type: "applicant",
                ...interviewData,
              },
            }),
          });
        }

        // Send reminder to interviewer
        if (!interviewerPrefs || interviewerPrefs.interview_reminders) {
          await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              type: "interview_reminder",
              to: interviewerProfile.email,
              data: {
                user_name: interviewerProfile.full_name || "Interviewer",
                user_type: "interviewer",
                applicant_name: applicantProfile.full_name || "Candidate",
                ...interviewData,
              },
            }),
          });
        }

        console.log(`Sent reminders for interview ${interview.id}`);
      } catch (error) {
        console.error(`Error processing interview ${interview.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: interviews?.length || 0 }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending interview reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
