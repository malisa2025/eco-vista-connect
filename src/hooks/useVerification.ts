import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VerificationRequest {
  businessId: string;
  tier: 'basic' | 'government' | 'premium';
  documents: Array<{ name: string; url: string; type: string }>;
}

export const useVerification = (businessId?: string) => {
  const queryClient = useQueryClient();

  const requests = useQuery({
    queryKey: ['verification-requests', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('business_id', businessId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!businessId
  });

  const submitRequest = useMutation({
    mutationFn: async (request: VerificationRequest) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          business_id: request.businessId,
          requested_by: user.id,
          tier_requested: request.tier,
          documents: request.documents,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
      toast.success('Verification request submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit request: ${error.message}`);
    }
  });

  return {
    requests: requests.data || [],
    isLoading: requests.isLoading,
    submitRequest
  };
};

export const useAdminVerification = () => {
  const queryClient = useQueryClient();

  const pendingRequests = useQuery({
    queryKey: ['admin-verification-requests'],
    queryFn: async () => {
      // Fetch verification requests without joins
      const { data: requests, error } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!requests || requests.length === 0) return [];

      // Get unique business IDs and user IDs
      const businessIds = [...new Set(requests.map(r => r.business_id).filter(Boolean))] as string[];
      const userIds = [...new Set(requests.map(r => r.requested_by).filter(Boolean))] as string[];

      // Fetch businesses separately
      let businesses: { id: string; name: string; logo_url: string | null }[] = [];
      if (businessIds.length > 0) {
        const { data: businessData, error: businessesError } = await supabase
          .from('businesses')
          .select('id, name, logo_url')
          .in('id', businessIds);

        if (businessesError) throw businessesError;
        businesses = businessData || [];
      }

      // Fetch profiles separately
      let profiles: { id: string; full_name: string | null; email: string | null }[] = [];
      if (userIds.length > 0) {
        const { data: profileData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        if (profilesError) throw profilesError;
        profiles = profileData || [];
      }

      // Create lookup maps
      const businessMap = new Map(businesses.map(b => [b.id, b]));
      const profileMap = new Map(profiles.map(p => [p.id, p]));

      // Merge all data
      return requests.map(request => ({
        ...request,
        businesses: request.business_id ? businessMap.get(request.business_id) || null : null,
        profiles: request.requested_by ? profileMap.get(request.requested_by) || null : null
      }));
    }
  });

  const approveRequest = useMutation({
    mutationFn: async ({ requestId, businessId, tier }: { requestId: string; businessId: string; tier: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update business verification
      const { error: businessError } = await supabase
        .from('businesses')
        .update({
          verification_tier: tier,
          verified_at: new Date().toISOString(),
          verified_by: user.id
        })
        .eq('id', businessId);

      if (businessError) throw businessError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Verification approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    }
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: reason
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] });
      toast.success('Verification rejected');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject: ${error.message}`);
    }
  });

  return {
    pendingRequests: pendingRequests.data || [],
    isLoading: pendingRequests.isLoading,
    approveRequest,
    rejectRequest
  };
};
