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
    const { advertisementId, dateRange = 30 } = await req.json();

    if (!advertisementId) {
      throw new Error('Advertisement ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Calculating ROI for ad ${advertisementId} over ${dateRange} days`);

    // Get ad details and cost
    const { data: ad, error: adError } = await supabaseClient
      .from('advertisements')
      .select('*, ad_spots(price_per_day)')
      .eq('id', advertisementId)
      .single();

    if (adError) throw adError;

    // Calculate total spend
    const startDate = new Date(ad.start_date);
    const endDate = ad.end_date ? new Date(ad.end_date) : new Date();
    const daysActive = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalSpend = ad.total_cost;

    // Get conversions and revenue
    const { data: conversions, error: convError } = await supabaseClient
      .from('ad_conversions')
      .select('*')
      .eq('advertisement_id', advertisementId);

    if (convError) throw convError;

    const totalRevenue = conversions?.reduce((sum, conv) => sum + (conv.value || 0), 0) || 0;
    const totalConversions = conversions?.length || 0;

    // Calculate metrics
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const avgOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;

    // Get daily performance data
    const { data: dailyStats } = await supabaseClient
      .from('ad_impressions_daily')
      .select('*')
      .eq('advertisement_id', advertisementId)
      .order('date', { ascending: false })
      .limit(dateRange);

    const totalImpressions = dailyStats?.reduce((sum, day) => sum + (day.impressions || 0), 0) || 0;
    const totalClicks = dailyStats?.reduce((sum, day) => sum + (day.clicks || 0), 0) || 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const costPerClick = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Simple ROI prediction (linear extrapolation)
    const avgDailyRevenue = daysActive > 0 ? totalRevenue / daysActive : 0;
    const remainingDays = ad.end_date ? 
      Math.ceil((new Date(ad.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;
    const projectedRevenue = totalRevenue + (avgDailyRevenue * remainingDays);
    const projectedROI = totalSpend > 0 ? ((projectedRevenue - totalSpend) / totalSpend) * 100 : 0;

    // Store ROI data
    const today = new Date().toISOString().split('T')[0];
    await supabaseClient
      .from('ad_roi_tracking')
      .upsert({
        advertisement_id: advertisementId,
        date: today,
        total_spend: totalSpend,
        total_revenue: totalRevenue,
        conversions: totalConversions,
        roi_percentage: roi
      });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          roi: Math.round(roi * 100) / 100,
          totalSpend,
          totalRevenue,
          totalConversions,
          cpa: Math.round(cpa * 100) / 100,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          ctr: Math.round(ctr * 100) / 100,
          costPerClick: Math.round(costPerClick * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
          predictions: {
            projectedRevenue: Math.round(projectedRevenue * 100) / 100,
            projectedROI: Math.round(projectedROI * 100) / 100,
            remainingDays
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error calculating ROI:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});