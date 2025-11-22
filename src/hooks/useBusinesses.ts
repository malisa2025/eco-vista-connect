import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseBusinessesParams {
  region?: string;
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'rating' | 'name';
  openNow?: boolean;
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
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,phone.ilike.%${params.search}%`);
      }

      // Filter by open now status
      if (params.openNow) {
        // First get business_ids that are currently open from cache
        const { data: openBusinesses } = await supabase
          .from('business_status_cache')
          .select('business_id')
          .eq('is_open_now', true);
        
        if (openBusinesses && openBusinesses.length > 0) {
          const openBusinessIds = openBusinesses.map(b => b.business_id);
          query = query.in('id', openBusinessIds);
        } else {
          // If no businesses are open, return empty array
          return [];
        }
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

export const useAllBusinessesForAdmin = () => {
  return useQuery({
    queryKey: ['all-businesses-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, logo_url')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};