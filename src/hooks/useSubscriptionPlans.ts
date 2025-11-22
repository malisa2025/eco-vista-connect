import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriptionPlans = (targetAudience?: 'job_seeker' | 'business') => {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans', targetAudience],
    queryFn: async () => {
      let query = supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (targetAudience) {
        query = query.eq('target_audience', targetAudience);
      }

      const { data, error } = await query.order('display_order');

      if (error) throw error;
      return data;
    },
  });

  const jobSeekerPlans = plans?.filter(p => p.target_audience === 'job_seeker') || [];
  const businessPlans = plans?.filter(p => p.target_audience === 'business') || [];

  return {
    plans,
    jobSeekerPlans,
    businessPlans,
    isLoading,
  };
};