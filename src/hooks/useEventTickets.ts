import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface EventTicket {
  id: string;
  event_id: string;
  user_id: string | null;
  registration_id: string | null;
  ticket_number: string;
  ticket_type: string;
  price_paid: number;
  payment_reference: string | null;
  payment_status: string;
  qr_code: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  attendee_name: string | null;
  attendee_email: string | null;
  created_at: string;
  updated_at: string;
  event?: {
    id: string;
    title: string;
    start_date: string;
    end_date: string | null;
    location: string | null;
    image_url: string | null;
    business_id: string;
    business?: {
      name: string;
    };
  };
}

// Fetch user's purchased tickets
export function useMyTickets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-tickets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('event_tickets')
        .select(`
          *,
          event:business_events(
            id,
            title,
            start_date,
            end_date,
            location,
            image_url,
            business_id,
            business:businesses(name)
          )
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EventTicket[];
    },
    enabled: !!user,
  });
}

// Fetch tickets for a specific event (for business owners)
export function useEventTickets(eventId: string) {
  return useQuery({
    queryKey: ['event-tickets', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EventTicket[];
    },
    enabled: !!eventId,
  });
}

// Ticket mutations
export function useTicketMutations() {
  const queryClient = useQueryClient();

  const checkInTicket = useMutation({
    mutationFn: async ({ ticketId, checkedIn }: { ticketId: string; checkedIn: boolean }) => {
      const { error } = await supabase
        .from('event_tickets')
        .update({
          checked_in: checkedIn,
          checked_in_at: checkedIn ? new Date().toISOString() : null,
        })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-tickets'] });
      toast({
        title: variables.checkedIn ? 'Checked In' : 'Check-in Removed',
        description: variables.checkedIn 
          ? 'Attendee has been checked in successfully.'
          : 'Check-in has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const cancelTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('event_tickets')
        .update({ payment_status: 'cancelled' })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['event-tickets'] });
      toast({
        title: 'Ticket Cancelled',
        description: 'Your ticket has been cancelled.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return { checkInTicket, cancelTicket };
}

// Fetch events by month for calendar view
export function useEventsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: ['events-by-month', year, month],
    queryFn: async () => {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from('business_events')
        .select(`
          *,
          business:businesses(name, logo_url)
        `)
        .eq('status', 'published')
        .gte('start_date', startOfMonth.toISOString())
        .lte('start_date', endOfMonth.toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}
