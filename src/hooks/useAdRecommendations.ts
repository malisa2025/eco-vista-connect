import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdRecommendations = (advertisementId: string) => {
  const { data: recommendationsData, isLoading, refetch } = useQuery({
    queryKey: ['ad-recommendations', advertisementId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-ad-recommendations', {
        body: { advertisementId },
      });

      if (error) throw error;
      return data.data;
    },
    enabled: !!advertisementId,
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    recommendations: recommendationsData?.recommendations || [],
    performanceScore: recommendationsData?.performanceScore,
    adPerformance: recommendationsData?.adPerformance,
    isLoading,
    refetch,
  };
};