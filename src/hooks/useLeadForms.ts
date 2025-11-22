import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLeadForms = (businessId: string) => {
  const queryClient = useQueryClient();

  const { data: forms, isLoading } = useQuery({
    queryKey: ['lead-forms', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_forms')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const createForm = useMutation({
    mutationFn: async (form: any) => {
      const { data, error } = await supabase
        .from('lead_forms')
        .insert(form)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-forms', businessId] });
      toast.success('Lead form created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create form: ' + error.message);
    },
  });

  const updateForm = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('lead_forms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-forms', businessId] });
      toast.success('Form updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update form: ' + error.message);
    },
  });

  const deleteForm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_forms')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-forms', businessId] });
      toast.success('Form deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete form: ' + error.message);
    },
  });

  return {
    forms,
    isLoading,
    createForm,
    updateForm,
    deleteForm,
  };
};