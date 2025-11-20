import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseBusinessesParams {
  region?: string;
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'rating' | 'name';
  limit?: number;
}

export const useBusinesses = (params: UseBusinessesParams = {}) => {
  return useQuery({
    queryKey: ['businesses', params],
    queryFn: async () => {
      let query = supabase
        .from('businesses')
        .select('*');

      if (params.region) {
        query = query.eq('region', params.region);
      }

      if (params.category) {
        query = query.eq('category', params.category);
      }

      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      // Apply sorting
      switch (params.sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};