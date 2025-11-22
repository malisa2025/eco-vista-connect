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
      jobId,
    }: {
      applicationId: string;
      status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
      jobId?: string;
    }) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status,
          reviewed_at: status === 'reviewed' ? new Date().toISOString() : undefined,
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Track usage when applicant is reviewed
      if (status === 'reviewed' && jobId) {
        const { data: job } = await supabase
          .from('jobs')
          .select('business_id')
          .eq('id', jobId)
          .single();

        if (job) {
          const { data: subscription } = await supabase
            .from('business_subscriptions')
            .select('id')
            .eq('business_id', job.business_id)
            .eq('status', 'active')
            .gte('end_date', new Date().toISOString())
            .single();

          if (subscription) {
            await supabase.rpc('increment_subscription_usage', {
              p_subscription_id: subscription.id,
              p_field: 'applicants_reviewed',
              p_increment: 1,
            });
          }
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['business-subscription'] });
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
