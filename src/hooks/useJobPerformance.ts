import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useJobPerformance = (jobId: string) => {
  return useQuery({
    queryKey: ['job-performance', jobId],
    queryFn: async () => {
      // Get job details
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          businesses:business_id (
            id,
            name,
            logo_url
          )
        `)
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      // Get performance cache
      const { data: performance } = await supabase
        .from('job_performance_cache')
        .select('*')
        .eq('job_id', jobId)
        .maybeSingle();

      // Get view statistics
      const { data: views } = await supabase
        .from('job_views')
        .select('viewed_at, source, device_type')
        .eq('job_id', jobId)
        .order('viewed_at', { ascending: true });

      // Get application statistics
      const { data: applications } = await supabase
        .from('job_applications')
        .select('applied_at, status, quality_score')
        .eq('job_id', jobId)
        .order('applied_at', { ascending: true });

      // Calculate time-based metrics
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const viewsLast7Days = views?.filter(
        (v) => new Date(v.viewed_at) > last7Days
      ).length || 0;

      const applicationsLast7Days = applications?.filter(
        (a) => new Date(a.applied_at) > last7Days
      ).length || 0;

      // Calculate conversion rate
      const conversionRate =
        views && views.length > 0
          ? ((applications?.length || 0) / views.length) * 100
          : 0;

      // Group views by source
      const viewsBySource = views?.reduce((acc: any, view) => {
        const source = view.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      // Group applications by status
      const applicationsByStatus = applications?.reduce((acc: any, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      // Calculate average quality score
      const avgQualityScore =
        applications && applications.length > 0
          ? applications.reduce((sum, app) => sum + (app.quality_score || 0), 0) /
            applications.length
          : 0;

      // Calculate time to first application
      const firstApplication = applications?.[0];
      const timeToFirstApplication = firstApplication
        ? Math.floor(
            (new Date(firstApplication.applied_at).getTime() -
              new Date(job.posted_at).getTime()) /
              (1000 * 60 * 60)
          )
        : null;

      return {
        job,
        performance: performance || {
          overall_score: 0,
          visibility_score: 0,
          engagement_score: 0,
          conversion_score: 0,
          quality_score: 0,
        },
        metrics: {
          totalViews: views?.length || 0,
          totalApplications: applications?.length || 0,
          conversionRate: conversionRate.toFixed(2),
          viewsLast7Days,
          applicationsLast7Days,
          avgQualityScore: avgQualityScore.toFixed(1),
          timeToFirstApplication,
        },
        views: views || [],
        applications: applications || [],
        viewsBySource,
        applicationsByStatus,
      };
    },
    enabled: !!jobId,
  });
};

export const useRecalculatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.rpc('calculate_job_performance', {
        p_job_id: jobId,
      });

      if (error) throw error;
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['job-performance', jobId] });
    },
  });
};

export const useTrackJobView = () => {
  return useMutation({
    mutationFn: async ({
      jobId,
      source,
      deviceType,
    }: {
      jobId: string;
      source?: string;
      deviceType?: string;
    }) => {
      const { error } = await supabase.from('job_views').insert({
        job_id: jobId,
        source: source || 'direct',
        device_type: deviceType || 'desktop',
        viewed_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
  });
};
