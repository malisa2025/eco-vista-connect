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

    console.log("Generating hiring digests...");

    // Get all business owners with active jobs
    const { data: businessOwners, error: ownersError } = await supabase
      .from("business_owners")
      .select(`
        user_id,
        is_primary,
        businesses(
          id,
          name,
          jobs(id, title, status)
        )
      `)
      .eq("is_primary", true);

    if (ownersError) throw ownersError;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const owner of businessOwners || []) {
      try {
        const business = owner.businesses as any;
        const activeJobs = business?.jobs?.filter((j: any) => j.status === "active") || [];

        if (activeJobs.length === 0) continue;

        // Get owner profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", owner.user_id)
          .single();

        if (!profile?.email) continue;

        // Check email preferences
        const { data: emailPrefs } = await supabase
          .from("email_preferences")
          .select("digest_emails")
          .eq("user_id", owner.user_id)
          .single();

        if (emailPrefs && !emailPrefs.digest_emails) continue;

        // Get applications stats for all active jobs
        const jobIds = activeJobs.map((j: any) => j.id);
        const { data: applications } = await supabase
          .from("job_applications")
          .select("*, profiles(full_name, experience_years, skills)")
          .in("job_id", jobIds)
          .gte("applied_at", weekAgo.toISOString());

        const newApplications = applications?.length || 0;
        const pendingReview = applications?.filter((a) => a.status === "pending").length || 0;
        const shortlisted = applications?.filter((a) => a.status === "shortlisted").length || 0;

        // Get quality applicants (those with >70% profile completeness)
        const qualityApplicants = applications?.filter((a: any) => {
          const profile = a.profiles;
          const score = (profile?.full_name ? 20 : 0) +
            (profile?.experience_years ? 20 : 0) +
            (profile?.skills?.length ? 20 : 0) +
            (a.resume_url ? 20 : 0) +
            (a.cover_letter?.length > 200 ? 20 : 0);
          return score >= 70;
        }) || [];

        // Get upcoming interviews
        const { data: interviews } = await supabase
          .from("interview_schedule")
          .select("*, job_applications(job_id)")
          .in("application_id", applications?.map((a) => a.id) || [])
          .eq("status", "scheduled")
          .gte("scheduled_at", new Date().toISOString());

        const jobsData = activeJobs.map((job: any) => {
          const jobApps = applications?.filter((a) => a.job_id === job.id) || [];
          return {
            title: job.title,
            new_applications: jobApps.length,
            pending: jobApps.filter((a) => a.status === "pending").length,
          };
        });

        // Send digest email
        await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            type: "hiring_digest",
            to: profile.email,
            data: {
              employer_name: profile.full_name || "Employer",
              business_name: business.name,
              new_applications: newApplications,
              pending_review: pendingReview,
              shortlisted,
              quality_applicants: qualityApplicants.length,
              upcoming_interviews: interviews?.length || 0,
              jobs: jobsData,
            },
          }),
        });

        console.log(`Sent digest to ${profile.email}`);
      } catch (error) {
        console.error(`Error processing owner ${owner.user_id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: businessOwners?.length || 0 }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending hiring digests:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
