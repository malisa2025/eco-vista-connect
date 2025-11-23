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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting ad benchmarks calculation...');

    // Get all active ads with their businesses
    const { data: ads, error: adsError } = await supabaseClient
      .from('advertisements')
      .select('id, business_id, businesses(category, region)')
      .eq('status', 'active');

    if (adsError) throw adsError;

    // Get clicks and impressions data
    const { data: dailyStats, error: statsError } = await supabaseClient
      .from('ad_impressions_daily')
      .select('advertisement_id, impressions, clicks');

    if (statsError) throw statsError;

    // Get conversions data
    const { data: conversions, error: conversionsError } = await supabaseClient
      .from('ad_conversions')
      .select('advertisement_id, value');

    if (conversionsError) throw conversionsError;

    // Aggregate data by category
    const categoryData: Record<string, {
      totalImpressions: number;
      totalClicks: number;
      totalConversions: number;
      totalSpend: number;
      adCount: number;
    }> = {};

    ads?.forEach((ad: any) => {
      const category = ad.businesses?.category || 'Other';
      
      if (!categoryData[category]) {
        categoryData[category] = {
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalSpend: 0,
          adCount: 0,
        };
      }

      // Sum up impressions and clicks for this ad
      const adStats = dailyStats?.filter(stat => stat.advertisement_id === ad.id) || [];
      const adImpressions = adStats.reduce((sum, stat) => sum + (stat.impressions || 0), 0);
      const adClicks = adStats.reduce((sum, stat) => sum + (stat.clicks || 0), 0);

      // Sum up conversions for this ad
      const adConversions = conversions?.filter(conv => conv.advertisement_id === ad.id) || [];
      const conversionCount = adConversions.length;

      categoryData[category].totalImpressions += adImpressions;
      categoryData[category].totalClicks += adClicks;
      categoryData[category].totalConversions += conversionCount;
      categoryData[category].adCount += 1;
    });

    // Calculate benchmarks and update database
    const updates = [];
    for (const [category, data] of Object.entries(categoryData)) {
      if (data.totalImpressions === 0) continue;

      const avgCTR = (data.totalClicks / data.totalImpressions) * 100;
      const avgConversionRate = data.totalClicks > 0 
        ? (data.totalConversions / data.totalClicks) * 100 
        : 0;
      
      // Estimate cost per click based on typical Ghana market rates
      const avgCPC = category === 'Technology' ? 0.5 : 
                     category === 'Finance' ? 0.7 :
                     category === 'Healthcare' ? 0.6 : 0.3;

      const { error: upsertError } = await supabaseClient
        .from('ad_benchmarks')
        .upsert({
          category,
          region: null,
          avg_ctr: avgCTR,
          avg_cost_per_click: avgCPC,
          avg_conversion_rate: avgConversionRate,
          sample_size: data.adCount,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'category,region'
        });

      if (upsertError) {
        console.error(`Error updating benchmark for ${category}:`, upsertError);
      } else {
        updates.push(category);
        console.log(`Updated benchmark for ${category}: CTR=${avgCTR.toFixed(2)}%, Conv=${avgConversionRate.toFixed(2)}%`);
      }
    }

    console.log(`Ad benchmarks calculation complete. Updated ${updates.length} categories.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated benchmarks for ${updates.length} categories`,
        categories: updates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error calculating ad benchmarks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
