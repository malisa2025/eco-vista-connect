import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserClaims = (userId?: string) => {
  return useQuery({
    queryKey: ['business-claims', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('business_claims')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useAllClaims = () => {
  return useQuery({
    queryKey: ['all-business-claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_claims')
        .select(`
          *,
          profiles:user_id (full_name, email),
          businesses (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useBusinessOwners = (userId?: string) => {
  return useQuery({
    queryKey: ['business-owners', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('business_owners')
        .select(`
          *,
          businesses (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useClaimMutations = () => {
  const queryClient = useQueryClient();

  const submitClaim = useMutation({
    mutationFn: async (claim: {
      business_id?: string;
      claim_type: 'new_business' | 'claim_existing';
      business_data?: any;
      documents?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('business_claims')
        .insert({
          ...claim,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-claims'] });
      toast.success('Claim submitted successfully! We will review it soon.');
    },
    onError: () => {
      toast.error('Failed to submit claim');
    },
  });

  const updateClaimStatus = useMutation({
    mutationFn: async ({
      claimId,
      status,
      adminNotes,
    }: {
      claimId: string;
      status: 'approved' | 'rejected';
      adminNotes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('business_claims')
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', claimId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-claims'] });
      queryClient.invalidateQueries({ queryKey: ['all-business-claims'] });
      toast.success('Claim status updated');
    },
    onError: () => {
      toast.error('Failed to update claim status');
    },
  });

  return { submitClaim, updateClaimStatus };
};
