import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBusinessSubscription = (businessId: string) => {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['business-subscription', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('business_id', businessId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const createSubscription = useMutation({
    mutationFn: async (subscriptionData: any) => {
      const { data, error } = await supabase
        .from('business_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-subscription', businessId] });
      toast.success('Subscription activated');
    },
    onError: (error: Error) => {
      toast.error('Failed to create subscription: ' + error.message);
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async ({ reason }: { reason?: string }) => {
      if (!subscription) throw new Error('No active subscription');

      const { data, error } = await supabase
        .from('business_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          auto_renew: false,
        })
        .eq('id', subscription.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-subscription', businessId] });
      toast.success('Subscription cancelled');
    },
    onError: (error: Error) => {
      toast.error('Failed to cancel subscription: ' + error.message);
    },
  });

  const toggleAutoRenew = useMutation({
    mutationFn: async (autoRenew: boolean) => {
      if (!subscription) throw new Error('No active subscription');

      const { data, error } = await supabase
        .from('business_subscriptions')
        .update({ auto_renew: autoRenew })
        .eq('id', subscription.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-subscription', businessId] });
      toast.success('Auto-renew updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update auto-renew: ' + error.message);
    },
  });

  const hasActiveSubscription = !!subscription && subscription.status === 'active' && new Date(subscription.end_date) > new Date();

  return {
    subscription,
    isLoading,
    hasActiveSubscription,
    createSubscription,
    cancelSubscription,
    toggleAutoRenew,
  };
};