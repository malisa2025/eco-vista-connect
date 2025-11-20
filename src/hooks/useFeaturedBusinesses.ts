import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFeaturedBusinesses = (limit: number = 6) => {
  return useQuery({
    queryKey: ['featured-businesses', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};