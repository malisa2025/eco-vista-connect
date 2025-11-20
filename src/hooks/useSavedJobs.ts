import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSavedJobs = (userId?: string) => {
  return useQuery({
    queryKey: ['saved-jobs', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          created_at,
          jobs (
            *,
            businesses (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useIsSaved = (jobId: string, userId?: string) => {
  return useQuery({
    queryKey: ['is-saved', jobId, userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data, error } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!userId && !!jobId,
  });
};

export const useSavedJobMutations = () => {
  const queryClient = useQueryClient();

  const saveJob = useMutation({
    mutationFn: async ({ jobId, userId }: { jobId: string; userId: string }) => {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          job_id: jobId,
          user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['is-saved'] });
      toast.success('Job saved');
    },
    onError: () => {
      toast.error('Failed to save job');
    },
  });

  const unsaveJob = useMutation({
    mutationFn: async ({ jobId, userId }: { jobId: string; userId: string }) => {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['is-saved'] });
      toast.success('Job removed from saved');
    },
    onError: () => {
      toast.error('Failed to remove saved job');
    },
  });

  return { saveJob, unsaveJob };
};
