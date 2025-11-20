import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBusinessAnalytics = (businessId: string) => {
  return useQuery({
    queryKey: ['business-analytics', businessId],
    queryFn: async () => {
      // Get all jobs for this business
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('business_id', businessId)
        .order('posted_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Get all applications for these jobs
      const jobIds = jobs.map((j) => j.id);
      
      const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .in('job_id', jobIds);

      // Get all views for these jobs
      const { data: views } = await supabase
        .from('job_views')
        .select('*')
        .in('job_id', jobIds);

      // Calculate overall metrics
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter((j) => j.status === 'active').length;
      const totalApplications = applications?.length || 0;
      const totalViews = views?.length || 0;

      // Calculate hired count (applications with status 'accepted')
      const hired = applications?.filter((a) => a.status === 'accepted').length || 0;

      // Calculate average time to hire
      const hiredApplications = applications?.filter((a) => a.status === 'accepted') || [];
      const avgTimeToHire =
        hiredApplications.length > 0
          ? hiredApplications.reduce((sum, app) => {
              const job = jobs.find((j) => j.id === app.job_id);
              if (!job?.posted_at) return sum;
              const days = Math.floor(
                (new Date(app.applied_at).getTime() -
                  new Date(job.posted_at).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return sum + days;
            }, 0) / hiredApplications.length
          : 0;

      // Group by category
      const jobsByCategory = jobs.reduce((acc: any, job) => {
        if (!acc[job.category]) {
          acc[job.category] = {
            count: 0,
            applications: 0,
            hired: 0,
          };
        }
        acc[job.category].count++;
        
        const jobApps = applications?.filter((a) => a.job_id === job.id) || [];
        acc[job.category].applications += jobApps.length;
        acc[job.category].hired += jobApps.filter((a) => a.status === 'accepted').length;
        
        return acc;
      }, {});

      // Calculate trends (last 30 days vs previous 30 days)
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentJobs = jobs.filter(
        (j) => j.posted_at && new Date(j.posted_at) > last30Days
      ).length;

      const recentApplications =
        applications?.filter((a) => new Date(a.applied_at) > last30Days).length || 0;

      const previousApplications =
        applications?.filter(
          (a) =>
            new Date(a.applied_at) > previous30Days &&
            new Date(a.applied_at) <= last30Days
        ).length || 0;

      const applicationTrend =
        previousApplications > 0
          ? ((recentApplications - previousApplications) / previousApplications) * 100
          : 0;

      // Calculate cost per hire (assuming 10 GHS per job post)
      const costPerHire = hired > 0 ? (totalJobs * 10) / hired : 0;

      return {
        overview: {
          totalJobs,
          activeJobs,
          totalApplications,
          hired,
          avgTimeToHire: Math.round(avgTimeToHire),
          costPerHire: Math.round(costPerHire),
        },
        trends: {
          recentJobs,
          recentApplications,
          applicationTrend: applicationTrend.toFixed(1),
        },
        jobsByCategory,
        jobs,
        applications: applications || [],
        views: views || [],
      };
    },
    enabled: !!businessId,
  });
};
