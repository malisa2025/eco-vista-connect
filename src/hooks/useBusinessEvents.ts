import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BusinessEvent {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  price: number;
  capacity: number | null;
  attendees_count: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  additional_info: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  business_id: string;
  title: string;
  description?: string;
  image_url?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  price?: number;
  capacity?: number;
  status?: 'draft' | 'published';
  additional_info?: Record<string, any>;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  status: 'registered' | 'cancelled' | 'attended';
  created_at: string;
}

// Fetch events for a specific business
export function useBusinessEvents(businessId: string | undefined) {
  return useQuery({
    queryKey: ['business-events', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('business_events')
        .select('*')
        .eq('business_id', businessId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as BusinessEvent[];
    },
    enabled: !!businessId,
  });
}

// Fetch upcoming published events across all businesses
export function useUpcomingEvents(limit = 10) {
  return useQuery({
    queryKey: ['upcoming-events', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_events')
        .select(`
          *,
          businesses:business_id (
            id,
            name,
            logo_url,
            region
          )
        `)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

// Fetch a single event by ID
export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase
        .from('business_events')
        .select(`
          *,
          businesses:business_id (
            id,
            name,
            logo_url,
            region,
            phone,
            email
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

// Fetch registrations for an event (business owner only)
export function useEventRegistrations(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EventRegistration[];
    },
    enabled: !!eventId,
  });
}

// Event mutations
export function useEventMutations() {
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const { data, error } = await supabase
        .from('business_events')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-events', variables.business_id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
      toast.success('Event created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create event');
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BusinessEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('business_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business-events', data.business_id] });
      queryClient.invalidateQueries({ queryKey: ['event', data.id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
      toast.success('Event updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update event');
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async ({ id, businessId }: { id: string; businessId: string }) => {
      const { error } = await supabase
        .from('business_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, businessId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business-events', data.businessId] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
      toast.success('Event deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });

  const registerForEvent = useMutation({
    mutationFn: async (input: {
      event_id: string;
      name: string;
      email: string;
      phone?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          ...input,
          user_id: userData.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event', variables.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations', variables.event_id] });
      toast.success('Successfully registered for event!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register for event');
    },
  });

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
  };
}
