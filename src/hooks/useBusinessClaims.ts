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
      // Fetch claims WITHOUT any joins to avoid FK issues
      const { data: claims, error } = await supabase
        .from('business_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!claims || claims.length === 0) return [];

      // Get unique user IDs and business IDs
      const userIds = [...new Set(claims.map(c => c.user_id))];
      const businessIds = [...new Set(claims.map(c => c.business_id).filter(Boolean))] as string[];
      
      // Fetch profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Fetch businesses separately (only if there are any business IDs)
      let businesses: { id: string; name: string }[] = [];
      if (businessIds.length > 0) {
        const { data: businessData, error: businessesError } = await supabase
          .from('businesses')
          .select('id, name')
          .in('id', businessIds);

        if (businessesError) throw businessesError;
        businesses = businessData || [];
      }

      // Create maps for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const businessMap = new Map(businesses.map(b => [b.id, b]));

      // Merge all data
      return claims.map(claim => ({
        ...claim,
        profiles: profileMap.get(claim.user_id) || null,
        businesses: claim.business_id ? businessMap.get(claim.business_id) || null : null
      }));
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
      business_data?: Record<string, unknown>;
      documents?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('business_claims')
        .insert({
          business_id: claim.business_id,
          claim_type: claim.claim_type,
          business_data: claim.business_data as any,
          documents: claim.documents as any,
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
    onError: (error: Error) => {
      console.error('Claim update error:', error);
      toast.error(`Failed to update claim status: ${error.message}`);
    },
  });

  return { submitClaim, updateClaimStatus };
};
