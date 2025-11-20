import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBusinessReviews = (businessId: string) => {
  return useQuery({
    queryKey: ['reviews', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useUserReview = (businessId: string, userId?: string) => {
  return useQuery({
    queryKey: ['user-review', businessId, userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useReviewMutations = (businessId: string) => {
  const queryClient = useQueryClient();

  const createReview = useMutation({
    mutationFn: async (review: {
      rating: number;
      title: string;
      comment: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          business_id: businessId,
          user_id: user.id,
          ...review,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Review submitted successfully!');
    },
    onError: () => {
      toast.error('Failed to submit review');
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({
      reviewId,
      updates,
    }: {
      reviewId: string;
      updates: { rating?: number; title?: string; comment?: string };
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Review updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update review');
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', businessId] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Review deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });

  const toggleHelpful = useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      if (isHelpful) {
        // Remove helpful vote
        const { error } = await supabase
          .from('review_helpful')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add helpful vote
        const { error } = await supabase
          .from('review_helpful')
          .insert({
            review_id: reviewId,
            user_id: user.id,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', businessId] });
    },
  });

  return {
    createReview,
    updateReview,
    deleteReview,
    toggleHelpful,
  };
};

export const useUserHelpfulReviews = (businessId: string, userId?: string) => {
  return useQuery({
    queryKey: ['user-helpful-reviews', businessId, userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('review_helpful')
        .select('review_id')
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(item => item.review_id);
    },
    enabled: !!userId,
  });
};
