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
      // Get current usage
      const { data: subscription } = await supabase
        .from('business_subscriptions')
        .select('current_usage')
        .eq('id', subscriptionId)
        .single();

      if (!subscription) throw new Error('Subscription not found');

      const currentUsage = (subscription.current_usage as Record<string, number>) || {};
      const newUsage = {
        ...currentUsage,
        [field]: ((currentUsage[field] as number) || 0) + increment,
      };

      // Update usage
      const { data, error } = await supabase
        .from('business_subscriptions')
        .update({ current_usage: newUsage })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
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
