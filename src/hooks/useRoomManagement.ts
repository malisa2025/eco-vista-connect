import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRoomManagement(hotelId?: string) {
  const queryClient = useQueryClient();

  const { data: roomTypes = [], isLoading } = useQuery({
    queryKey: ["room-types", hotelId],
    queryFn: async () => {
      if (!hotelId) return [];

      const { data, error } = await supabase
        .from("room_types")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!hotelId,
  });

  const createRoom = useMutation({
    mutationFn: async (roomData: any) => {
      const { data, error } = await supabase
        .from("room_types")
        .insert([roomData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types", hotelId] });
    },
  });

  const updateRoom = useMutation({
    mutationFn: async ({ id, ...roomData }: any) => {
      const { data, error } = await supabase
        .from("room_types")
        .update(roomData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types", hotelId] });
    },
  });

  const deleteRoom = useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase
        .from("room_types")
        .delete()
        .eq("id", roomId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types", hotelId] });
    },
  });

  return {
    roomTypes,
    loading: isLoading,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}
