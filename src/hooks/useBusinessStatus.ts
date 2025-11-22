import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBusinessStatus = (businessId: string) => {
  return useQuery({
    queryKey: ['business-status', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('is_business_open', { p_business_id: businessId });

      if (error) throw error;

      return {
        isOpen: data as boolean | null,
        lastChecked: new Date()
      };
    },
    refetchInterval: 60000, // Refresh every minute
    enabled: !!businessId
  });
};

export const useOpenBusinesses = () => {
  return useQuery({
    queryKey: ['open-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_status_cache')
        .select('business_id, is_open_now')
        .eq('is_open_now', true);

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000
  });
};
