import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdROI = (advertisementId: string, dateRange: number = 30) => {
  const { data: roiData, isLoading, refetch } = useQuery({
    queryKey: ['ad-roi', advertisementId, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('calculate-ad-roi', {
        body: { advertisementId, dateRange },
      });

      if (error) throw error;
      return data.data;
    },
    enabled: !!advertisementId,
  });

  const { data: historicalROI, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['ad-roi-history', advertisementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_roi_tracking')
        .select('*')
        .eq('advertisement_id', advertisementId)
        .order('date', { ascending: true })
        .limit(30);

      if (error) throw error;
      return data;
    },
    enabled: !!advertisementId,
  });

  return {
    roiData,
    historicalROI,
    isLoading: isLoading || isLoadingHistory,
    refetch,
  };
};