import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLeadMutations = (businessId: string) => {
  const queryClient = useQueryClient();

  const createLead = useMutation({
    mutationFn: async (lead: any) => {
      const { data, error } = await supabase
        .from('business_leads')
        .insert(lead)
        .select()
        .single();

      if (error) throw error;

      // Trigger notifications
      await supabase.functions.invoke('send-lead-notification', {
        body: { leadId: data.id },
      });

      // Generate lead score
      await supabase.functions.invoke('generate-lead-score', {
        body: { leadId: data.id },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-leads', businessId] });
      toast.success('Lead captured successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create lead: ' + error.message);
    },
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const { data, error } = await supabase
        .from('business_leads')
        .update({ status })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-leads', businessId] });
      toast.success('Lead status updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const addLeadNote = useMutation({
    mutationFn: async ({ leadId, content }: { leadId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: leadId,
          activity_type: 'note',
          content,
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
      toast.success('Note added');
    },
    onError: (error: Error) => {
      toast.error('Failed to add note: ' + error.message);
    },
  });

  const assignLead = useMutation({
    mutationFn: async ({ leadId, userId }: { leadId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('business_leads')
        .update({ assigned_to: userId })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-leads', businessId] });
      toast.success('Lead assigned');
    },
    onError: (error: Error) => {
      toast.error('Failed to assign lead: ' + error.message);
    },
  });

  return {
    createLead,
    updateLeadStatus,
    addLeadNote,
    assignLead,
  };
};