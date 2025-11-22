import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export const useAdDailyStats = (adId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['ad-daily-stats', adId, days],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('ad_impressions_daily')
        .select('*')
        .eq('advertisement_id', adId)
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Calculate CTR for each day
      return data.map(stat => ({
        ...stat,
        ctr: stat.impressions > 0 ? (stat.clicks / stat.impressions) * 100 : 0,
      }));
    },
    enabled: !!adId,
  });
};

export const useAdPerformanceSummary = (adId: string) => {
  return useQuery({
    queryKey: ['ad-performance-summary', adId],
    queryFn: async () => {
      // Get ad details
      const { data: ad, error: adError } = await supabase
        .from('advertisements')
        .select(`
          *,
          businesses (name, logo_url, category, region),
          ad_spots (name, location, price_per_day)
        `)
        .eq('id', adId)
        .single();

      if (adError) throw adError;

      // Get total clicks
      const { count: totalClicks } = await supabase
        .from('ad_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('advertisement_id', adId);

      // Calculate metrics
      const impressions = ad.impressions || 0;
      const clicks = totalClicks || 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const costPerClick = clicks > 0 ? ad.total_cost / clicks : 0;
      const estimatedReach = Math.floor(impressions * 0.6);

      // Calculate days active
      const startDate = new Date(ad.start_date);
      const endDate = new Date(ad.end_date);
      const today = new Date();
      const daysActive = Math.floor(
        (Math.min(today.getTime(), endDate.getTime()) - startDate.getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      return {
        ad,
        totalImpressions: impressions,
        totalClicks: clicks,
        ctr,
        costPerClick,
        estimatedReach,
        daysActive,
        daysRemaining: Math.max(0, Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
      };
    },
    enabled: !!adId,
  });
};

export const useBusinessAdsComparison = (businessId: string) => {
  return useQuery({
    queryKey: ['business-ads-comparison', businessId],
    queryFn: async () => {
      const { data: ads, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get clicks for each ad
      const adsWithMetrics = await Promise.all(
        ads.map(async (ad) => {
          const { count: clicks } = await supabase
            .from('ad_clicks')
            .select('*', { count: 'exact', head: true })
            .eq('advertisement_id', ad.id);

          const ctr = ad.impressions > 0 ? ((clicks || 0) / ad.impressions) * 100 : 0;

          return {
            name: ad.title.substring(0, 20) + (ad.title.length > 20 ? '...' : ''),
            ctr,
            impressions: ad.impressions || 0,
            clicks: clicks || 0,
          };
        })
      );

      return adsWithMetrics;
    },
    enabled: !!businessId,
  });
};
