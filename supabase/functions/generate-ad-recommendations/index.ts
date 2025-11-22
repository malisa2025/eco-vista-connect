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
    const { advertisementId } = await req.json();

    if (!advertisementId) {
      throw new Error('Advertisement ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Generating recommendations for ad ${advertisementId}`);

    // Get ad performance data
    const { data: ad, error: adError } = await supabaseClient
      .from('advertisements')
      .select('*, businesses(category, region), ad_spots(location)')
      .eq('id', advertisementId)
      .single();

    if (adError) throw adError;

    const { data: dailyStats } = await supabaseClient
      .from('ad_impressions_daily')
      .select('*')
      .eq('advertisement_id', advertisementId)
      .order('date', { ascending: false })
      .limit(30);

    const totalImpressions = dailyStats?.reduce((sum, day) => sum + (day.impressions || 0), 0) || 0;
    const totalClicks = dailyStats?.reduce((sum, day) => sum + (day.clicks || 0), 0) || 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Get benchmark for comparison
    const { data: benchmark } = await supabaseClient
      .from('ad_benchmarks')
      .select('*')
      .eq('category', ad.businesses.category)
      .maybeSingle();

    const recommendations = [];

    // CTR Analysis
    if (benchmark && ctr < benchmark.avg_ctr) {
      recommendations.push({
        type: 'ctr_improvement',
        priority: 'high',
        title: 'Improve Click-Through Rate',
        description: `Your CTR is ${ctr.toFixed(2)}%, below the industry average of ${benchmark.avg_ctr.toFixed(2)}%. Try using more compelling images and clear call-to-action text.`,
        expectedImpact: 'Could increase clicks by 20-40%',
        actions: [
          'Test different ad images',
          'Add urgency to CTA (e.g., "Limited Time")',
          'Highlight unique value proposition'
        ]
      });
    }

    // Low impressions
    if (totalImpressions < 500) {
      recommendations.push({
        type: 'visibility',
        priority: 'high',
        title: 'Increase Ad Visibility',
        description: 'Your ad has low impressions. Consider boosting budget or running A/B tests to find better-performing variants.',
        expectedImpact: 'Could reach 3-5x more potential customers',
        actions: [
          'Extend campaign duration',
          'Choose additional ad spots',
          'Increase daily budget'
        ]
      });
    }

    // No conversions tracked
    const { data: conversions } = await supabaseClient
      .from('ad_conversions')
      .select('*')
      .eq('advertisement_id', advertisementId);

    if (!conversions || conversions.length === 0) {
      recommendations.push({
        type: 'conversion_tracking',
        priority: 'medium',
        title: 'Set Up Conversion Tracking',
        description: 'You haven\'t tracked any conversions yet. Add conversion tracking to measure your ad\'s true ROI.',
        expectedImpact: 'Essential for understanding campaign effectiveness',
        actions: [
          'Add lead capture forms',
          'Track phone call clicks',
          'Monitor website visits'
        ]
      });
    }

    // Best times to run ads (simplified analysis)
    const hourlyPerformance = dailyStats?.reduce((acc: any, stat) => {
      const hour = new Date(stat.date).getHours();
      if (!acc[hour]) acc[hour] = { impressions: 0, clicks: 0 };
      acc[hour].impressions += stat.impressions || 0;
      acc[hour].clicks += stat.clicks || 0;
      return acc;
    }, {});

    if (hourlyPerformance && Object.keys(hourlyPerformance).length > 0) {
      const bestHours = Object.entries(hourlyPerformance)
        .map(([hour, data]: [string, any]) => ({
          hour: parseInt(hour),
          ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0
        }))
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 3)
        .map(h => `${h.hour}:00-${h.hour + 1}:00`);

      recommendations.push({
        type: 'timing',
        priority: 'low',
        title: 'Optimize Ad Schedule',
        description: `Your ads perform best during: ${bestHours.join(', ')}. Consider focusing budget on these times.`,
        expectedImpact: 'Could improve ROI by 10-20%',
        actions: ['Schedule ads during peak hours', 'Reduce budget during low-performing times']
      });
    }

    // A/B testing recommendation
    const { data: variants } = await supabaseClient
      .from('ad_variants')
      .select('*')
      .eq('advertisement_id', advertisementId);

    if (!variants || variants.length === 0) {
      recommendations.push({
        type: 'ab_testing',
        priority: 'medium',
        title: 'Run A/B Tests',
        description: 'Testing different ad versions can significantly improve performance. Start with 2-3 variants.',
        expectedImpact: 'Could improve CTR by 30-50%',
        actions: [
          'Create variants with different images',
          'Test different headlines',
          'Try various CTAs'
        ]
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          recommendations: recommendations.slice(0, 5), // Top 5 recommendations
          performanceScore: ctr > (benchmark?.avg_ctr || 2) ? 'good' : 'needs_improvement',
          adPerformance: {
            ctr: ctr.toFixed(2),
            industryAvg: benchmark?.avg_ctr?.toFixed(2) || 'N/A',
            impressions: totalImpressions,
            clicks: totalClicks
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});