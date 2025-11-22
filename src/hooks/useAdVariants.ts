import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdVariants = (advertisementId: string) => {
  const queryClient = useQueryClient();

  const { data: variants, isLoading } = useQuery({
    queryKey: ['ad-variants', advertisementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_variants')
        .select('*')
        .eq('advertisement_id', advertisementId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!advertisementId,
  });

  const createVariant = useMutation({
    mutationFn: async (variant: any) => {
      const { data, error } = await supabase
        .from('ad_variants')
        .insert(variant)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-variants', advertisementId] });
      toast.success('Variant created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create variant: ' + error.message);
    },
  });

  const updateVariant = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('ad_variants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-variants', advertisementId] });
      toast.success('Variant updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update variant: ' + error.message);
    },
  });

  const deleteVariant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ad_variants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-variants', advertisementId] });
      toast.success('Variant deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete variant: ' + error.message);
    },
  });

  const analyzeABTest = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-ab-test', {
        body: { advertisementId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-variants', advertisementId] });
      toast.success('A/B test analyzed');
    },
  });

  return {
    variants,
    isLoading,
    createVariant,
    updateVariant,
    deleteVariant,
    analyzeABTest,
  };
};