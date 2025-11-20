import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo, useState, useCallback } from 'react';

interface AdFilters {
  status: string;
  location: string;
  search: string;
}

export const useAdminAdvertisements = (filters: AdFilters) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const { data: rawAds, isLoading, refetch } = useQuery({
    queryKey: ['admin-ads', filters],
    queryFn: async () => {
      let query = supabase
        .from('advertisements')
        .select(`
          *,
          businesses (name, logo_url),
          ad_spots (name, location)
        `)
        .order('created_at', { ascending: false });
      
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as any);
      }
      
      // Apply location filter - fetch ads with matching ad spots
      if (filters.location && filters.location !== 'all') {
        const { data: spots } = await supabase
          .from('ad_spots')
          .select('id')
          .eq('location', filters.location as any);
        
        if (spots && spots.length > 0) {
          query = query.in('ad_spot_id', spots.map(s => s.id));
        }
      }

      const { data: adsData, error } = await query;
      if (error) throw error;

      // Fetch click counts for all ads
      const adsWithClicks = await Promise.all(
        (adsData || []).map(async (ad) => {
          const { count } = await supabase
            .from('ad_clicks')
            .select('*', { count: 'exact', head: true })
            .eq('advertisement_id', ad.id);
          
          return {
            ...ad,
            total_clicks: count || 0,
            ctr: (ad.impressions || 0) > 0 ? ((count || 0) / (ad.impressions || 0) * 100).toFixed(2) : '0.00'
          };
        })
      );
      
      return adsWithClicks;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Apply search filter on client side
  const filteredAds = useMemo(() => {
    if (!rawAds) return [];
    
    let filtered = rawAds;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title?.toLowerCase().includes(searchLower) ||
        ad.businesses?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [rawAds, filters.search]);

  // Apply sorting
  const sortedAds = useMemo(() => {
    if (!sortConfig) return filteredAds;

    const sorted = [...filteredAds].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [filteredAds, sortConfig]);

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  return {
    ads: sortedAds,
    isLoading,
    refetch,
    sortConfig,
    handleSort
  };
};

export const useAdminAdvertisementStats = () => {
  return useQuery({
    queryKey: ['admin-ad-stats'],
    queryFn: async () => {
      // Fetch all advertisements
      const { data: ads, error: adsError } = await supabase
        .from('advertisements')
        .select('id, status, impressions, total_cost, payment_status');
      
      if (adsError) throw adsError;

      // Fetch all clicks
      const { count: totalClicks, error: clicksError } = await supabase
        .from('ad_clicks')
        .select('*', { count: 'exact', head: true });
      
      if (clicksError) throw clicksError;

      const totalActiveAds = ads?.filter(ad => ad.status === 'active').length || 0;
      const totalImpressions = ads?.reduce((sum, ad) => sum + (ad.impressions || 0), 0) || 0;
      const totalRevenue = ads?.filter(ad => ad.payment_status === 'paid')
        .reduce((sum, ad) => sum + (ad.total_cost || 0), 0) || 0;
      const averageCTR = totalImpressions > 0 
        ? (((totalClicks || 0) / totalImpressions) * 100).toFixed(2)
        : '0.00';

      return {
        totalActiveAds,
        totalImpressions,
        totalClicks: totalClicks || 0,
        averageCTR,
        totalRevenue
      };
    },
    refetchInterval: 30000,
  });
};
