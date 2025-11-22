import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { subscriptionId, subscriptionType } = await req.json();

    if (!subscriptionId || !subscriptionType) {
      throw new Error('Subscription ID and type are required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Predicting churn for ${subscriptionType} subscription ${subscriptionId}`);

    let churnRisk = 0;
    const factors = [];
    const actions = [];

    if (subscriptionType === 'job_seeker') {
      // Get job seeker subscription
      const { data: subscription } = await supabaseClient
        .from('job_seeker_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (!subscription) throw new Error('Subscription not found');

      // Check usage - applications submitted
      const { data: applications } = await supabaseClient
        .from('job_applications')
        .select('id')
        .eq('user_id', subscription.user_id)
        .gte('applied_at', subscription.start_date);

      const appCount = applications?.length || 0;
      
      if (appCount === 0) {
        churnRisk += 40;
        factors.push('No job applications submitted');
        actions.push('Send re-engagement email with job recommendations');
      } else if (appCount < 3) {
        churnRisk += 20;
        factors.push('Low application activity');
        actions.push('Highlight successful job match stories');
      }

      // Check time until renewal
      const daysUntilRenewal = Math.ceil(
        (new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilRenewal <= 7 && !subscription.auto_renew) {
        churnRisk += 30;
        factors.push('Renewal approaching without auto-renew');
        actions.push('Send renewal reminder with discount offer');
      }

      // Check profile completeness
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', subscription.user_id)
        .single();

      const profileComplete = profile?.resume_url && profile?.skills?.length > 0;
      if (!profileComplete) {
        churnRisk += 15;
        factors.push('Incomplete profile');
        actions.push('Send profile completion reminder');
      }

    } else if (subscriptionType === 'business') {
      // Get business subscription
      const { data: subscription } = await supabaseClient
        .from('business_subscriptions')
        .select('*, subscription_plans(limits)')
        .eq('id', subscriptionId)
        .single();

      if (!subscription) throw new Error('Subscription not found');

      // Check usage logs
      const { data: usageLogs } = await supabaseClient
        .from('subscription_usage_logs')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const usageCount = usageLogs?.length || 0;

      if (usageCount === 0) {
        churnRisk += 50;
        factors.push('Zero platform usage in last 30 days');
        actions.push('Schedule check-in call to understand barriers');
      } else if (usageCount < 10) {
        churnRisk += 25;
        factors.push('Very low usage');
        actions.push('Send onboarding tutorial and best practices guide');
      }

      // Check job posting activity
      const { data: jobs } = await supabaseClient
        .from('jobs')
        .select('id')
        .eq('business_id', subscription.business_id)
        .gte('created_at', subscription.start_date);

      const jobCount = jobs?.length || 0;

      if (jobCount === 0) {
        churnRisk += 30;
        factors.push('No jobs posted');
        actions.push('Offer job posting assistance');
      }

      // Check if approaching limits
      const currentUsage = subscription.current_usage as any;
      const limits = subscription.subscription_plans?.limits as any;

      if (limits && currentUsage) {
        const usagePercentage = (currentUsage.jobs || 0) / (limits.jobs || 1) * 100;
        if (usagePercentage < 20) {
          churnRisk += 20;
          factors.push('Using less than 20% of plan limits');
          actions.push('Suggest downgrade to lower tier or offer custom plan');
        }
      }

      // Check time until renewal
      const daysUntilRenewal = Math.ceil(
        (new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilRenewal <= 14 && !subscription.auto_renew) {
        churnRisk += 25;
        factors.push('Renewal approaching without auto-renew');
        actions.push('Send renewal offer with added value (free month, upgraded features)');
      }
    }

    // Cap at 100
    churnRisk = Math.min(churnRisk, 100);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (churnRisk >= 70) {
      riskLevel = 'critical';
    } else if (churnRisk >= 50) {
      riskLevel = 'high';
    } else if (churnRisk >= 30) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    console.log(`Churn risk calculated: ${churnRisk}% (${riskLevel})`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          churnRisk,
          riskLevel,
          factors,
          actions
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error predicting churn:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});