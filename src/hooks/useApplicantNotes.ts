import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAddNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      applicationId,
      note,
    }: {
      applicationId: string;
      note: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('applicant_notes').insert({
        application_id: applicationId,
        author_id: user.id,
        note,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      toast({
        title: 'Note Added',
        description: 'Your note has been saved.',
      });
    },
  });
};

export const useAddTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      applicationId,
      tag,
      color,
    }: {
      applicationId: string;
      tag: string;
      color?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('applicant_tags').insert({
        application_id: applicationId,
        tag,
        color: color || '#6366f1',
        created_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      toast({
        title: 'Tag Added',
        description: 'Tag has been added to the applicant.',
      });
    },
  });
};

export const useRemoveTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('applicant_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      toast({
        title: 'Tag Removed',
        description: 'Tag has been removed.',
      });
    },
  });
};

export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      applicationId,
      scheduledAt,
      location,
      meetingLink,
      durationMinutes,
    }: {
      applicationId: string;
      scheduledAt: string;
      location?: string;
      meetingLink?: string;
      durationMinutes?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('interview_schedule').insert({
        application_id: applicationId,
        scheduled_at: scheduledAt,
        location,
        meeting_link: meetingLink,
        duration_minutes: durationMinutes || 60,
        interviewer_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      toast({
        title: 'Interview Scheduled',
        description: 'Interview has been scheduled successfully.',
      });
    },
  });
};
