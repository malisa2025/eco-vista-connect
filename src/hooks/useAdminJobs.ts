import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JobFilters {
  search?: string;
  status?: string;
  businessId?: string;
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useAdminJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: ['admin-jobs', filters],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          businesses:business_id (
            id,
            name,
            logo_url,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,businesses.name.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as any);
      }

      if (filters.businessId) {
        query = query.eq('business_id', filters.businessId);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      if (filters.dateFrom) {
        query = query.gte('posted_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('posted_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate conversion rates and enrich with stats
      const enrichedJobs = await Promise.all(
        data.map(async (job) => {
          // Get application count
          const { count: appCount } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);

          const conversionRate =
            job.views_count > 0
              ? ((appCount || 0) / job.views_count) * 100
              : 0;

          return {
            ...job,
            application_count: appCount || 0,
            conversion_rate: conversionRate.toFixed(1),
          };
        })
      );

      return enrichedJobs;
    },
  });
};

export const useJobAnalytics = () => {
  return useQuery({
    queryKey: ['job-analytics'],
    queryFn: async () => {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*');

      if (error) throw error;

      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      const { count: activeJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: totalApplications } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true });

      const avgApplications =
        totalJobs && totalJobs > 0 ? (totalApplications || 0) / totalJobs : 0;

      return {
        totalJobs: totalJobs || 0,
        activeJobs: activeJobs || 0,
        totalApplications: totalApplications || 0,
        avgApplicationsPerJob: avgApplications.toFixed(1),
      };
    },
  });
};

export const useAdminJobMutations = () => {
  const queryClient = useQueryClient();

  const updateJob = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast.success('Job updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update job');
      console.error(error);
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('jobs').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete job');
      console.error(error);
    },
  });

  const closeJob = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'closed' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast.success('Job closed successfully');
    },
    onError: (error) => {
      toast.error('Failed to close job');
      console.error(error);
    },
  });

  const extendExpiry = useMutation({
    mutationFn: async ({ id, days }: { id: string; days: number }) => {
      const { data: job, error: fetchError } = await supabase
        .from('jobs')
        .select('expires_at')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentExpiry = new Date(job.expires_at);
      const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('jobs')
        .update({ expires_at: newExpiry.toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast.success('Job expiry extended successfully');
    },
    onError: (error) => {
      toast.error('Failed to extend job expiry');
      console.error(error);
    },
  });

  const flagJob = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ is_flagged: true, flag_reason: reason })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast.success('Job flagged successfully');
    },
    onError: (error) => {
      toast.error('Failed to flag job');
      console.error(error);
    },
  });

  const unflagJob = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ is_flagged: false, flag_reason: null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast.success('Job unflagged successfully');
    },
    onError: (error) => {
      toast.error('Failed to unflag job');
      console.error(error);
    },
  });

  return {
    updateJob,
    deleteJob,
    closeJob,
    extendExpiry,
    flagJob,
    unflagJob,
  };
};
