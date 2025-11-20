import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking for ad alerts...');

    // Get all active ads
    const { data: activeAds, error: adsError } = await supabase
      .from('advertisements')
      .select(`
        *,
        businesses (name),
        ad_spots (name, location)
      `)
      .eq('status', 'active');

    if (adsError) throw adsError;

    const today = new Date();
    const alerts = [];

    for (const ad of activeAds || []) {
      const endDate = new Date(ad.end_date);
      const startDate = new Date(ad.start_date);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const daysActive = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Get business owner email
      const { data: owner } = await supabase
        .from('business_owners')
        .select('user_id')
        .eq('business_id', ad.business_id)
        .eq('is_primary', true)
        .single();

      if (!owner) continue;

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', owner.user_id)
        .single();

      if (!profile?.email) continue;

      // Check for expiration warnings (3 days, 1 day)
      if (daysUntilExpiry === 3 || daysUntilExpiry === 1) {
        alerts.push({
          type: 'expiring_soon',
          email: profile.email,
          data: {
            user_name: profile.full_name || 'Business Owner',
            ad_title: ad.title,
            business_name: ad.businesses.name,
            days_remaining: daysUntilExpiry,
            impressions: ad.impressions || 0,
          },
        });
      }

      // Check for low performance (CTR < 1% after 7 days)
      if (daysActive >= 7) {
        const { count: clicks } = await supabase
          .from('ad_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('advertisement_id', ad.id);

        const ctr = ad.impressions > 0 ? ((clicks || 0) / ad.impressions) * 100 : 0;

        if (ctr < 1) {
          alerts.push({
            type: 'low_performance',
            email: profile.email,
            data: {
              user_name: profile.full_name || 'Business Owner',
              ad_title: ad.title,
              business_name: ad.businesses.name,
              ctr: ctr.toFixed(2),
              impressions: ad.impressions || 0,
              clicks: clicks || 0,
            },
          });
        }
      }
    }

    // Send all alerts
    for (const alert of alerts) {
      await supabase.functions.invoke('send-notification-email', {
        body: alert,
      });
    }

    console.log(`Sent ${alerts.length} ad alerts`);

    return new Response(
      JSON.stringify({ success: true, alertsSent: alerts.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in check-ad-alerts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
