import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chi-square test for statistical significance
function chiSquareTest(impressionsA: number, clicksA: number, impressionsB: number, clicksB: number): number {
  const n1 = impressionsA;
  const n2 = impressionsB;
  const p1 = n1 > 0 ? clicksA / n1 : 0;
  const p2 = n2 > 0 ? clicksB / n2 : 0;
  const p = (clicksA + clicksB) / (n1 + n2);

  const expected1 = n1 * p;
  const expected2 = n2 * p;

  if (expected1 === 0 || expected2 === 0) return 0;

  const chiSquare = 
    Math.pow(clicksA - expected1, 2) / expected1 +
    Math.pow((n1 - clicksA) - (n1 - expected1), 2) / (n1 - expected1) +
    Math.pow(clicksB - expected2, 2) / expected2 +
    Math.pow((n2 - clicksB) - (n2 - expected2), 2) / (n2 - expected2);

  // Convert to confidence level (simplified)
  if (chiSquare >= 10.83) return 99.9;
  if (chiSquare >= 7.88) return 99.5;
  if (chiSquare >= 6.63) return 99;
  if (chiSquare >= 3.84) return 95;
  if (chiSquare >= 2.71) return 90;
  return 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { advertisementId } = await req.json();

    if (!advertisementId) {
      throw new Error('Advertisement ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Analyzing A/B test for ad ${advertisementId}`);

    // Get all variants for this ad
    const { data: variants, error: varError } = await supabaseClient
      .from('ad_variants')
      .select('*')
      .eq('advertisement_id', advertisementId)
      .order('impressions', { ascending: false });

    if (varError) throw varError;

    if (!variants || variants.length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Need at least 2 variants to run A/B test analysis'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate CTR for each variant
    const variantsWithCTR = variants.map(v => ({
      ...v,
      ctr: v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0,
      conversionRate: v.clicks > 0 ? (v.conversions / v.clicks) * 100 : 0
    }));

    // Find best performing variant
    const bestVariant = variantsWithCTR.reduce((best, current) => 
      current.ctr > best.ctr ? current : best
    , variantsWithCTR[0]);

    // Check if we have statistical significance (at least 100 impressions per variant)
    const minImpressions = Math.min(...variants.map(v => v.impressions));
    const hasEnoughData = minImpressions >= 100;

    // Calculate confidence between top 2 variants
    const sortedVariants = [...variantsWithCTR].sort((a, b) => b.ctr - a.ctr);
    const winner = sortedVariants[0];
    const runnerUp = sortedVariants[1];

    const confidence = hasEnoughData 
      ? chiSquareTest(winner.impressions, winner.clicks, runnerUp.impressions, runnerUp.clicks)
      : 0;

    const shouldSwitch = confidence >= 95 && !winner.is_winner;

    // If confidence is high enough, mark winner
    if (shouldSwitch) {
      console.log(`Declaring variant ${winner.id} as winner with ${confidence}% confidence`);
      
      await supabaseClient
        .from('ad_variants')
        .update({ is_winner: false })
        .eq('advertisement_id', advertisementId);

      await supabaseClient
        .from('ad_variants')
        .update({ is_winner: true })
        .eq('id', winner.id);

      // Update main ad with winning variant's content
      await supabaseClient
        .from('advertisements')
        .update({
          title: winner.title,
          description: winner.description,
          image_url: winner.image_url
        })
        .eq('id', advertisementId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          winner: {
            id: winner.id,
            name: winner.variant_name,
            ctr: winner.ctr.toFixed(2),
            impressions: winner.impressions,
            clicks: winner.clicks,
            conversions: winner.conversions
          },
          runnerUp: {
            id: runnerUp.id,
            name: runnerUp.variant_name,
            ctr: runnerUp.ctr.toFixed(2),
            impressions: runnerUp.impressions
          },
          confidence: confidence.toFixed(1),
          shouldSwitch,
          hasEnoughData,
          recommendation: !hasEnoughData 
            ? 'Continue testing until each variant has at least 100 impressions'
            : confidence >= 95
            ? `Variant "${winner.variant_name}" is the clear winner with ${confidence.toFixed(1)}% confidence`
            : `Keep testing. Need ${95 - confidence}% more confidence to declare a winner`,
          allVariants: variantsWithCTR.map(v => ({
            id: v.id,
            name: v.variant_name,
            ctr: v.ctr.toFixed(2),
            impressions: v.impressions,
            clicks: v.clicks,
            isWinner: v.is_winner
          }))
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error analyzing A/B test:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});