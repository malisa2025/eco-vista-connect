import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IncrementUsageParams {
  subscriptionId: string;
  field: 'jobs_posted' | 'applicants_reviewed' | 'ai_credits_used';
  increment?: number;
}

export const useUsageTracking = () => {
  const queryClient = useQueryClient();

  const incrementUsage = useMutation({
    mutationFn: async ({ subscriptionId, field, increment = 1 }: IncrementUsageParams) => {
      const { error } = await supabase.rpc('increment_subscription_usage', {
        p_subscription_id: subscriptionId,
        p_field: field,
        p_increment: increment,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['business-subscription'] });
    },
    onError: (error: Error) => {
      console.error('Usage tracking error:', error);
      toast.error('Failed to update usage tracking');
    },
  });

  return {
    incrementUsage,
  };
};
