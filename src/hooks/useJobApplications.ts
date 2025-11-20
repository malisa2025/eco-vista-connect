import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useJobApplications = (jobId: string) => {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            avatar_url,
            phone
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

export const useMyApplications = (userId: string) => {
  return useQuery({
    queryKey: ['my-applications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            id,
            title,
            location,
            job_type,
            businesses (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useApplicationMutations = () => {
  const queryClient = useQueryClient();

  const submitApplication = useMutation({
    mutationFn: async (applicationData: {
      job_id: string;
      user_id: string;
      cover_letter: string;
      video_url?: string;
      resume_url?: string;
    }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application submitted successfully!');
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate')) {
        toast.error('You have already applied for this job');
      } else {
        toast.error(`Failed to submit application: ${error.message}`);
      }
    },
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes 
    }: { 
      id: string; 
      status: string; 
      notes?: string;
    }) => {
      const updates: any = { 
        status,
        reviewed_at: new Date().toISOString(),
      };
      
      if (notes !== undefined) {
        updates.notes = notes;
      }

      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user?.id) {
        updates.reviewed_by = session.session.user.id;
      }

      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application status updated!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  return { submitApplication, updateApplicationStatus };
};

export const useJobSeekerSubscription = (userId: string) => {
  return useQuery({
    queryKey: ['job-seeker-subscription', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_seeker_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      // Check if subscription is actually active
      if (data && data.status === 'active') {
        const now = new Date();
        const endDate = new Date(data.end_date);
        if (endDate < now) {
          // Subscription has expired, update status
          await supabase
            .from('job_seeker_subscriptions')
            .update({ status: 'expired' })
            .eq('id', data.id);
          
          return { ...data, status: 'expired' };
        }
      }
      
      return data;
    },
    enabled: !!userId,
  });
};