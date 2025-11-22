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
    const { leadId } = await req.json();

    if (!leadId) {
      throw new Error('Lead ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Generating lead score for lead ${leadId}`);

    // Get lead details
    const { data: lead, error: leadError } = await supabaseClient
      .from('business_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;

    let score = 0;
    const factors = [];

    // Contact information completeness (0-30 points)
    if (lead.name) {
      score += 10;
      factors.push('Has name');
    }
    if (lead.email) {
      score += 10;
      factors.push('Has email');
    }
    if (lead.phone) {
      score += 10;
      factors.push('Has phone number');
    }

    // Message quality (0-20 points)
    if (lead.message) {
      const messageLength = lead.message.length;
      if (messageLength > 200) {
        score += 20;
        factors.push('Detailed message (high intent)');
      } else if (messageLength > 50) {
        score += 10;
        factors.push('Moderate message length');
      } else {
        score += 5;
        factors.push('Short message');
      }
    }

    // Company name provided (0-15 points)
    if (lead.company) {
      score += 15;
      factors.push('Company provided (B2B lead)');
    }

    // Source quality (0-20 points)
    const sourceScores: Record<string, number> = {
      'ad': 15,        // Paid traffic, high intent
      'referral': 20,  // Referred by someone, highest quality
      'organic': 10,   // Found naturally, good intent
      'direct': 5      // Typed URL directly
    };
    const sourceScore = sourceScores[lead.source] || 5;
    score += sourceScore;
    factors.push(`Source: ${lead.source}`);

    // UTM campaign parameters (0-10 points)
    if (lead.utm_campaign) {
      score += 5;
      factors.push('Came from marketing campaign');
    }
    if (lead.utm_medium) {
      score += 5;
      factors.push('Tracked marketing medium');
    }

    // Timing - recent leads are hotter (0-5 points)
    const createdAt = new Date(lead.created_at);
    const hoursSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated < 1) {
      score += 5;
      factors.push('Very recent (< 1 hour)');
    } else if (hoursSinceCreated < 24) {
      score += 3;
      factors.push('Recent (< 24 hours)');
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Determine lead temperature
    let temperature: 'hot' | 'warm' | 'cold';
    if (score >= 70) {
      temperature = 'hot';
    } else if (score >= 40) {
      temperature = 'warm';
    } else {
      temperature = 'cold';
    }

    // Generate recommendations
    const recommendations = [];
    if (temperature === 'hot') {
      recommendations.push('Contact immediately - high-quality lead');
      recommendations.push('Prioritize phone call over email');
    } else if (temperature === 'warm') {
      recommendations.push('Contact within 24 hours');
      recommendations.push('Send personalized email first');
    } else {
      recommendations.push('Add to nurture campaign');
      recommendations.push('Qualify further before heavy follow-up');
    }

    if (!lead.phone) {
      recommendations.push('Try to get phone number for faster communication');
    }

    // Update lead score in database
    await supabaseClient
      .from('business_leads')
      .update({ score })
      .eq('id', leadId);

    console.log(`Lead score calculated: ${score} (${temperature})`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          score,
          temperature,
          factors,
          recommendations
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error generating lead score:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});