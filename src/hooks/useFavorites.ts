import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFavorites = (userId?: string) => {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          business_id,
          businesses (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useIsFavorite = (businessId: string, userId?: string) => {
  return useQuery({
    queryKey: ['is-favorite', businessId, userId],
    queryFn: async () => {
      if (!userId) return false;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!userId,
  });
};

export const useFavoriteMutations = () => {
  const queryClient = useQueryClient();

  const addFavorite = useMutation({
    mutationFn: async ({ businessId, userId }: { businessId: string; userId: string }) => {
      const { error } = await supabase
        .from('favorites')
        .insert({
          business_id: businessId,
          user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['is-favorite'] });
      toast.success('Added to favorites');
    },
    onError: () => {
      toast.error('Failed to add to favorites');
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async ({ businessId, userId }: { businessId: string; userId: string }) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('business_id', businessId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['is-favorite'] });
      toast.success('Removed from favorites');
    },
    onError: () => {
      toast.error('Failed to remove from favorites');
    },
  });

  return { addFavorite, removeFavorite };
};
