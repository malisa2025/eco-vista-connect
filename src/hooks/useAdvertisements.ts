import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdSpots = () => {
  return useQuery({
    queryKey: ['ad-spots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_spots')
        .select('*')
        .order('price_per_day', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useActiveAds = (location?: string) => {
  return useQuery({
    queryKey: ['active-ads', location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          businesses (name, logo_url),
          ad_spots!inner (location, name)
        `)
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());

      if (error) throw error;
      
      // Filter by location if provided
      if (location && data) {
        return data.filter((ad: any) => ad.ad_spots?.location === location);
      }
      
      return data;
    },
  });
};

export const useBusinessAds = (businessId?: string) => {
  return useQuery({
    queryKey: ['business-ads', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          ad_spots (*)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch click counts for each ad
      const adsWithClicks = await Promise.all(
        data.map(async (ad) => {
          const { count } = await supabase
            .from('ad_clicks')
            .select('*', { count: 'exact', head: true })
            .eq('advertisement_id', ad.id);

          const clicks = count || 0;
          const ctr = ad.impressions > 0 ? (clicks / ad.impressions) * 100 : 0;

          return {
            ...ad,
            total_clicks: clicks,
            ctr: ctr.toFixed(2),
          };
        })
      );

      return adsWithClicks;
    },
    enabled: !!businessId,
  });
};

interface CreateAdminAdInput {
  business_id: string;
  ad_spot_id: string;
  title: string;
  description?: string;
  image_url: string;
  video_url?: string;
  video_thumbnail_url?: string;
  video_duration?: number;
  link_url?: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: 'draft' | 'active' | 'paused';
  payment_status?: 'pending' | 'success';
  payment_reference?: string;
}

export const useAdMutations = () => {
  const queryClient = useQueryClient();

  const createAd = useMutation({
    mutationFn: async (ad: {
      business_id: string;
      ad_spot_id: string;
      title: string;
      description?: string;
      image_url: string;
      link_url?: string;
      start_date: string;
      end_date: string;
      total_cost: number;
    }) => {
      const { data, error } = await supabase
        .from('advertisements')
        .insert(ad)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-ads'] });
      toast.success('Advertisement created successfully');
    },
    onError: () => {
      toast.error('Failed to create advertisement');
    },
  });

  const updateAdStatus = useMutation({
    mutationFn: async ({
      adId,
      status,
    }: {
      adId: string;
      status: 'active' | 'paused' | 'expired';
    }) => {
      const { error } = await supabase
        .from('advertisements')
        .update({ status })
        .eq('id', adId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-ads'] });
      queryClient.invalidateQueries({ queryKey: ['active-ads'] });
      toast.success('Advertisement status updated');
    },
  });

  const recordAdClick = useMutation({
    mutationFn: async (adId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('ad_clicks').insert({
        advertisement_id: adId,
        user_id: user?.id,
      });

      if (error) throw error;
    },
  });

  const recordAdImpression = useMutation({
    mutationFn: async (adId: string) => {
      // Fetch current impressions count
      const { data: ad } = await supabase
        .from('advertisements')
        .select('impressions')
        .eq('id', adId)
        .single();

      if (!ad) return;

      // Increment impressions
      const { error } = await supabase
        .from('advertisements')
        .update({ impressions: (ad.impressions || 0) + 1 })
        .eq('id', adId);

      if (error) throw error;
    },
  });

  const createAdminAd = useMutation({
    mutationFn: async (ad: CreateAdminAdInput) => {
      const { data, error } = await supabase
        .from('advertisements')
        .insert({
          ...ad,
          payment_status: ad.payment_status || 'success',
          paid_at: ad.payment_status === 'success' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-ads'] });
      queryClient.invalidateQueries({ queryKey: ['active-ads'] });
      toast.success('Advertisement created successfully by admin');
    },
    onError: (error) => {
      console.error('Admin ad creation error:', error);
      toast.error('Failed to create advertisement');
    },
  });

  return { createAd, updateAdStatus, recordAdClick, recordAdImpression, createAdminAd };
};
