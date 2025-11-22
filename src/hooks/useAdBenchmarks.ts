import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdBenchmarks = (category?: string, region?: string) => {
  const { data: benchmarks, isLoading } = useQuery({
    queryKey: ['ad-benchmarks', category, region],
    queryFn: async () => {
      let query = supabase.from('ad_benchmarks').select('*');

      if (category) {
        query = query.eq('category', category);
      }

      if (region) {
        query = query.eq('region', region);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const getBenchmark = (cat: string, reg?: string) => {
    return benchmarks?.find(
      (b) => b.category === cat && (!reg || b.region === reg)
    );
  };

  return {
    benchmarks,
    isLoading,
    getBenchmark,
  };
};