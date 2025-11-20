import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type BusinessUpdate = Partial<Tables<'businesses'>>;

export const useBusinessUpdate = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: BusinessUpdate) => {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', businessId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      toast({
        title: 'Success',
        description: 'Business updated successfully',
      });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update business',
        variant: 'destructive',
      });
    },
  });
};
