import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdConversions = (advertisementId: string) => {
  const queryClient = useQueryClient();

  const { data: conversions, isLoading } = useQuery({
    queryKey: ['ad-conversions', advertisementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_conversions')
        .select('*')
        .eq('advertisement_id', advertisementId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!advertisementId,
  });

  const recordConversion = useMutation({
    mutationFn: async (conversion: {
      advertisement_id: string;
      variant_id?: string;
      conversion_type: string;
      value?: number;
      metadata?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('ad_conversions')
        .insert({
          ...conversion,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-conversions', advertisementId] });
    },
  });

  const conversionsByType = conversions?.reduce((acc: any, conv) => {
    acc[conv.conversion_type] = (acc[conv.conversion_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = conversions?.reduce((sum, conv) => sum + (conv.value || 0), 0) || 0;

  return {
    conversions,
    isLoading,
    recordConversion,
    conversionsByType,
    totalRevenue,
    totalConversions: conversions?.length || 0,
  };
};