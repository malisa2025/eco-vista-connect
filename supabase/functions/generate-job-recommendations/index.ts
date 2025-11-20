import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user profile with preferences
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get user's job application history
    const { data: applications } = await supabaseClient
      .from('job_applications')
      .select('job_id, jobs(*)')
      .eq('user_id', userId)
      .limit(10);

    // Get user's saved jobs
    const { data: savedJobs } = await supabaseClient
      .from('saved_jobs')
      .select('job_id, jobs(*)')
      .eq('user_id', userId)
      .limit(10);

    // Build matching criteria from user data
    const userSkills = profile?.skills || [];
    const preferredTypes = profile?.preferred_job_types || [];
    const preferredLocations = profile?.preferred_locations || [];
    const experienceLevel = profile?.experience_years 
      ? profile.experience_years < 2 ? 'entry' 
      : profile.experience_years < 5 ? 'mid' 
      : 'senior'
      : null;

    // Query for matching jobs
    let query = supabaseClient
      .from('jobs')
      .select('*, businesses(*)')
      .eq('status', 'active')
      .order('posted_at', { ascending: false })
      .limit(20);

    // Apply filters based on user preferences
    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    const { data: jobs } = await query;

    if (!jobs) {
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Score and rank jobs based on user preferences
    const scoredJobs = jobs.map(job => {
      let score = 0;

      // Skill matching (check if job description contains user skills)
      if (userSkills.length > 0) {
        const jobText = `${job.title} ${job.description} ${job.requirements}`.toLowerCase();
        const matchingSkills = userSkills.filter((skill: string) => 
          jobText.includes(skill.toLowerCase())
        );
        score += matchingSkills.length * 3;
      }

      // Job type preference
      if (preferredTypes.includes(job.job_type)) {
        score += 2;
      }

      // Location preference
      if (preferredLocations.length > 0 && job.location) {
        const matchesLocation = preferredLocations.some((loc: string) => 
          job.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (matchesLocation) score += 2;
      }

      // Recency bonus
      const daysOld = (Date.now() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) score += 1;

      return { ...job, score };
    });

    // Sort by score and return top recommendations
    const recommendations = scoredJobs
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(({ score, ...job }) => job);

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
