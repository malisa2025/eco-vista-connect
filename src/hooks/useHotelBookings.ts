import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHotelBookings(hotelId?: string) {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["hotel-bookings", hotelId],
    queryFn: async () => {
      if (!hotelId) return [];

      const { data, error } = await supabase
        .from("hotel_bookings")
        .select(`
          *,
          room_types (
            id,
            name
          )
        `)
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!hotelId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" }) => {
      const { data, error } = await supabase
        .from("hotel_bookings")
        .update({ status })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotel-bookings", hotelId] });
    },
  });

  return {
    bookings,
    loading: isLoading,
    updateStatus,
  };
}
