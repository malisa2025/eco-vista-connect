import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch active partners for homepage
export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Partner[];
    },
  });
};

// Fetch all partners for admin panel
export const useAllPartners = () => {
  return useQuery({
    queryKey: ['all-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Partner[];
    },
  });
};

// Partner mutations
export const usePartnerMutations = () => {
  const queryClient = useQueryClient();

  const createPartner = useMutation({
    mutationFn: async (partner: {
      name: string;
      logo_url: string;
      website_url?: string;
      is_active?: boolean;
    }) => {
      // Get current max display_order
      const { data: maxOrder } = await supabase
        .from('partners')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      const display_order = (maxOrder?.display_order || 0) + 1;

      const { data, error } = await supabase
        .from('partners')
        .insert({ ...partner, display_order })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['all-partners'] });
      toast.success('Partner added successfully');
    },
    onError: () => {
      toast.error('Failed to add partner');
    },
  });

  const updatePartner = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        name: string;
        logo_url: string;
        website_url: string;
        is_active: boolean;
      }>;
    }) => {
      const { error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['all-partners'] });
      toast.success('Partner updated successfully');
    },
    onError: () => {
      toast.error('Failed to update partner');
    },
  });

  const deletePartner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['all-partners'] });
      toast.success('Partner deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete partner');
    },
  });

  const reorderPartners = useMutation({
    mutationFn: async (partners: Array<{ id: string; display_order: number }>) => {
      const updates = partners.map(({ id, display_order }) =>
        supabase
          .from('partners')
          .update({ display_order })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['all-partners'] });
      toast.success('Partner order updated');
    },
    onError: () => {
      toast.error('Failed to reorder partners');
    },
  });

  const togglePartnerStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('partners')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['all-partners'] });
      toast.success('Partner status updated');
    },
    onError: () => {
      toast.error('Failed to update partner status');
    },
  });

  return {
    createPartner,
    updatePartner,
    deletePartner,
    reorderPartners,
    togglePartnerStatus,
  };
};
