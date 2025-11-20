import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBusinessJobs = (businessIds: string[]) => {
  return useQuery({
    queryKey: ['business-jobs', businessIds],
    queryFn: async () => {
      if (!businessIds || businessIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          businesses (
            id,
            name,
            logo_url
          )
        `)
        .in('business_id', businessIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: businessIds && businessIds.length > 0,
  });
};

export const usePublicJobs = (filters?: {
  category?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['public-jobs', filters],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          businesses (
            id,
            name,
            logo_url
          )
        `)
        .eq('status', 'active')
        .order('posted_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.jobType) {
        query = query.eq('job_type', filters.jobType as any);
      }
      if (filters?.experienceLevel) {
        query = query.eq('experience_level', filters.experienceLevel as any);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useJob = (jobId: string) => {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          businesses (
            id,
            name,
            logo_url,
            description,
            website,
            email,
            phone
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;

      // Increment views count
      supabase
        .from('jobs')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', jobId)
        .then();

      return data;
    },
    enabled: !!jobId,
  });
};

export const useJobMutations = () => {
  const queryClient = useQueryClient();

  const createJob = useMutation({
    mutationFn: async (jobData: any) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-jobs'] });
      toast.success('Job posted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to post job: ${error.message}`);
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['business-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job'] });
      toast.success('Job updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update job: ${error.message}`);
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-jobs'] });
      toast.success('Job deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete job: ${error.message}`);
    },
  });

  return { createJob, updateJob, deleteJob };
};

export const useJobStats = (businessIds: string[]) => {
  return useQuery({
    queryKey: ['job-stats', businessIds],
    queryFn: async () => {
      if (!businessIds || businessIds.length === 0) {
        return {
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
        };
      }

      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, status, applications_count')
        .in('business_id', businessIds);

      if (error) throw error;

      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(j => j.status === 'active').length;
      const totalApplications = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);

      return {
        totalJobs,
        activeJobs,
        totalApplications,
      };
    },
    enabled: businessIds && businessIds.length > 0,
  });
};