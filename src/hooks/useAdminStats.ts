import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  total_businesses: number;
  total_users: number;
  total_reviews: number;
  pending_claims: number;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      
      if (error) throw error;
      return data[0] as AdminStats;
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_recent_activity');
      
      if (error) throw error;
      return data;
    },
  });
};
