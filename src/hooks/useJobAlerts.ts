import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JobAlert {
  id?: string;
  name: string;
  keywords?: string;
  category?: string;
  location?: string;
  job_type?: string;
  experience_level?: string;
  frequency: string;
  is_active: boolean;
}

export const useJobAlerts = (userId?: string) => {
  return useQuery({
    queryKey: ['job-alerts', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useJobAlertMutations = () => {
  const queryClient = useQueryClient();

  const createAlert = useMutation({
    mutationFn: async ({ alert, userId }: { alert: JobAlert; userId: string }) => {
      const { error } = await supabase
        .from('job_alerts')
        .insert({
          ...alert,
          user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Job alert created');
    },
    onError: () => {
      toast.error('Failed to create job alert');
    },
  });

  const updateAlert = useMutation({
    mutationFn: async ({ alertId, alert }: { alertId: string; alert: Partial<JobAlert> }) => {
      const { error } = await supabase
        .from('job_alerts')
        .update(alert)
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Job alert updated');
    },
    onError: () => {
      toast.error('Failed to update job alert');
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('job_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Job alert deleted');
    },
    onError: () => {
      toast.error('Failed to delete job alert');
    },
  });

  return { createAlert, updateAlert, deleteAlert };
};
