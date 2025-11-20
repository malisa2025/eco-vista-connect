import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePipeline = (jobId: string) => {
  return useQuery({
    queryKey: ['pipeline', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          ),
          applicant_notes (
            id,
            note,
            created_at,
            author:author_id (
              full_name
            )
          ),
          applicant_tags (
            id,
            tag,
            color
          ),
          interview_schedule (
            id,
            scheduled_at,
            status,
            location,
            meeting_link
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
    }) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      toast({
        title: 'Status Updated',
        description: 'Application status has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        variant: 'destructive',
      });
    },
  });
};
