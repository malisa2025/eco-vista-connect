import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessCategories = () => {
  return useQuery({
    queryKey: ['business-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};