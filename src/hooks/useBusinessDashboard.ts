import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export const useBusinessDashboard = (businessId: string | undefined) => {
  // Get business details
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ["business-dashboard", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Get stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["business-dashboard-stats", businessId],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Views this month
      const { count: viewsThisMonth } = await supabase
        .from("business_views")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("viewed_at", monthStart.toISOString())
        .lte("viewed_at", monthEnd.toISOString());

      // Views last month
      const { count: viewsLastMonth } = await supabase
        .from("business_views")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("viewed_at", lastMonthStart.toISOString())
        .lte("viewed_at", lastMonthEnd.toISOString());

      // Leads this month
      const { count: leadsThisMonth } = await supabase
        .from("business_leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());

      // Leads last month
      const { count: leadsLastMonth } = await supabase
        .from("business_leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("created_at", lastMonthStart.toISOString())
        .lte("created_at", lastMonthEnd.toISOString());

      // Total leads
      const { count: totalLeads } = await supabase
        .from("business_leads")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

      // Jobs stats
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, status, applications_count")
        .eq("business_id", businessId);

      const activeJobs = jobs?.filter(j => j.status === "active").length || 0;
      const totalApplications = jobs?.reduce((acc, j) => acc + (j.applications_count || 0), 0) || 0;

      // Reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("business_id", businessId);

      const avgRating = reviews?.length 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0;

      // Active ads
      const { count: activeAds } = await supabase
        .from("advertisements")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("status", "active");

      // Calculate growth percentages
      const viewsGrowth = viewsLastMonth 
        ? Math.round(((viewsThisMonth || 0) - viewsLastMonth) / viewsLastMonth * 100) 
        : 0;
      const leadsGrowth = leadsLastMonth 
        ? Math.round(((leadsThisMonth || 0) - leadsLastMonth) / leadsLastMonth * 100) 
        : 0;

      return {
        viewsThisMonth: viewsThisMonth || 0,
        viewsLastMonth: viewsLastMonth || 0,
        viewsGrowth,
        leadsThisMonth: leadsThisMonth || 0,
        leadsLastMonth: leadsLastMonth || 0,
        leadsGrowth,
        totalLeads: totalLeads || 0,
        activeJobs,
        totalApplications,
        avgRating,
        totalReviews: reviews?.length || 0,
        activeAds: activeAds || 0,
      };
    },
    enabled: !!businessId,
  });

  // Get recent leads
  const { data: recentLeads } = useQuery({
    queryKey: ["business-recent-leads", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_leads")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Get recent reviews
  const { data: recentReviews } = useQuery({
    queryKey: ["business-recent-reviews", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Get views trend (last 7 days)
  const { data: viewsTrend } = useQuery({
    queryKey: ["business-views-trend", businessId],
    queryFn: async () => {
      const days = 7;
      const trends: { date: string; views: number }[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const { count } = await supabase
          .from("business_views")
          .select("*", { count: "exact", head: true })
          .eq("business_id", businessId)
          .gte("viewed_at", dayStart.toISOString())
          .lte("viewed_at", dayEnd.toISOString());
        
        trends.push({
          date: format(dayStart, "EEE"),
          views: count || 0,
        });
      }
      
      return trends;
    },
    enabled: !!businessId,
  });

  return {
    business,
    stats,
    recentLeads,
    recentReviews,
    viewsTrend,
    isLoading: businessLoading || statsLoading,
  };
};
