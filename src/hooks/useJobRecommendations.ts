import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useJobRecommendations = (userId?: string) => {
  return useQuery({
    queryKey: ['job-recommendations', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase.functions.invoke('generate-job-recommendations', {
        body: { userId },
      });

      if (error) throw error;
      return data?.recommendations || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
