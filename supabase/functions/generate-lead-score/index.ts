import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('generate-lead-score function invoked');
  console.log('Request method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    
    const { leadId } = body;

    if (!leadId) {
      console.error('Lead ID is missing from request');
      throw new Error('Lead ID is required');
    }

    console.log(`Processing lead score for lead ID: ${leadId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get lead details
    console.log('Fetching lead details from database...');
    const { data: lead, error: leadError } = await supabaseClient
      .from('business_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Failed to fetch lead:', leadError);
      throw leadError;
    }

    if (!lead) {
      console.error('Lead not found with ID:', leadId);
      throw new Error('Lead not found');
    }

    console.log('Lead found:', lead.name, lead.email);

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
      'ad': 15,
      'referral': 20,
      'organic': 10,
      'direct': 5,
      'website': 10,
      'contact_form': 10
    };
    const sourceScore = sourceScores[lead.source] || 5;
    score += sourceScore;
    factors.push(`Source: ${lead.source || 'unknown'}`);

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
    console.log(`Updating lead score in database: ${score}`);
    const { error: updateError } = await supabaseClient
      .from('business_leads')
      .update({ score })
      .eq('id', leadId);

    if (updateError) {
      console.error('Failed to update lead score:', updateError);
      // Don't throw - the score calculation succeeded, just the update failed
    } else {
      console.log('Lead score updated successfully');
    }

    console.log(`Lead score calculated: ${score} (${temperature})`);
    console.log('Factors:', factors.join(', '));

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
    console.error('Error in generate-lead-score function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
