import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeadFilters {
  status?: string;
  source?: string;
  minScore?: number;
  searchQuery?: string;
}

export const useBusinessLeads = (businessId: string, filters?: LeadFilters) => {
  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ['business-leads', businessId, filters],
    queryFn: async () => {
      let query = supabase
        .from('business_leads')
        .select('*, lead_forms(name)')
        .eq('business_id', businessId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.minScore) {
        query = query.gte('score', filters.minScore);
      }

      if (filters?.searchQuery) {
        query = query.or(
          `name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%,company.ilike.%${filters.searchQuery}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const leadsByStatus = leads?.reduce((acc: any, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leadsBySource = leads?.reduce((acc: any, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hotLeads = leads?.filter(l => l.score >= 70) || [];
  const warmLeads = leads?.filter(l => l.score >= 40 && l.score < 70) || [];
  const coldLeads = leads?.filter(l => l.score < 40) || [];

  return {
    leads,
    isLoading,
    refetch,
    leadsByStatus,
    leadsBySource,
    hotLeads,
    warmLeads,
    coldLeads,
    totalLeads: leads?.length || 0,
  };
};