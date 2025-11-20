import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useAdminSubscriptions = (filters: SubscriptionFilters) => {
  return useQuery({
    queryKey: ['admin-subscriptions', filters],
    queryFn: async () => {
      let query = supabase
        .from('job_seeker_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as any);
      }

      if (filters.dateFrom) {
        query = query.gte('start_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('start_date', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with profile data and application counts
      const enrichedSubs = await Promise.all(
        data.map(async (sub) => {
          // Get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .eq('id', sub.user_id)
            .single();

          const { count: appCount } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', sub.user_id);

          const { data: lastApp } = await supabase
            .from('job_applications')
            .select('applied_at')
            .eq('user_id', sub.user_id)
            .order('applied_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...sub,
            profiles: profile,
            application_count: appCount || 0,
            last_application_date: lastApp?.applied_at,
          };
        })
      );

      // Apply search filter on enriched data
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return enrichedSubs.filter(
          (sub) =>
            sub.profiles?.full_name?.toLowerCase().includes(searchLower) ||
            sub.profiles?.email?.toLowerCase().includes(searchLower)
        );
      }

      return enrichedSubs;
    },
  });
};

export const useSubscriptionAnalytics = (timeRange: string = '30days') => {
  return useQuery({
    queryKey: ['subscription-analytics', timeRange],
    queryFn: async () => {
      const { count: totalSubscribers } = await supabase
        .from('job_seeker_subscriptions')
        .select('*', { count: 'exact', head: true });

      const { count: activeSubscribers } = await supabase
        .from('job_seeker_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString());

      const { count: expiredSubscribers } = await supabase
        .from('job_seeker_subscriptions')
        .select('*', { count: 'exact', head: true })
        .or('status.eq.expired,end_date.lt.' + new Date().toISOString());

      // Calculate MRR
      const mrr = (activeSubscribers || 0) * 10;

      // Calculate churn rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: cancelledRecently } = await supabase
        .from('job_seeker_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled')
        .gte('cancelled_at', thirtyDaysAgo.toISOString());

      const churnRate =
        activeSubscribers && activeSubscribers > 0
          ? ((cancelledRecently || 0) / activeSubscribers) * 100
          : 0;

      // Get payment history for revenue calculations
      const { data: payments } = await supabase
        .from('subscription_payments')
        .select('amount, paid_at')
        .eq('status', 'success')
        .order('paid_at', { ascending: true });

      // Calculate total revenue
      const totalRevenue = payments?.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      ) || 0;

      // Get new subscriptions this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newThisMonth } = await supabase
        .from('job_seeker_subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', startOfMonth.toISOString());

      return {
        totalSubscribers: totalSubscribers || 0,
        activeSubscribers: activeSubscribers || 0,
        expiredSubscribers: expiredSubscribers || 0,
        mrr,
        churnRate: churnRate.toFixed(1),
        totalRevenue,
        newThisMonth: newThisMonth || 0,
        arpu: 10, // Fixed at 10 GHS per subscriber
      };
    },
  });
};

export const useAdminSubscriptionMutations = () => {
  const queryClient = useQueryClient();

  const extendSubscription = useMutation({
    mutationFn: async ({ id, days }: { id: string; days: number }) => {
      const { data: sub, error: fetchError } = await supabase
        .from('job_seeker_subscriptions')
        .select('end_date')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentEndDate = new Date(sub.end_date);
      const newEndDate = new Date(currentEndDate.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('job_seeker_subscriptions')
        .update({ 
          end_date: newEndDate.toISOString(),
          status: 'active'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Subscription extended successfully');
    },
    onError: (error) => {
      toast.error('Failed to extend subscription');
      console.error(error);
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('job_seeker_subscriptions')
        .update({
          status: 'cancelled',
          auto_renew: false,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || 'Admin cancellation',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error) => {
      toast.error('Failed to cancel subscription');
      console.error(error);
    },
  });

  const updateAutoRenew = useMutation({
    mutationFn: async ({ id, autoRenew }: { id: string; autoRenew: boolean }) => {
      const { data, error } = await supabase
        .from('job_seeker_subscriptions')
        .update({ auto_renew: autoRenew })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Auto-renew updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update auto-renew');
      console.error(error);
    },
  });

  const addAdminNote = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { data, error } = await supabase
        .from('job_seeker_subscriptions')
        .update({ admin_notes: note })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Note saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save note');
      console.error(error);
    },
  });

  return {
    extendSubscription,
    cancelSubscription,
    updateAutoRenew,
    addAdminNote,
  };
};
