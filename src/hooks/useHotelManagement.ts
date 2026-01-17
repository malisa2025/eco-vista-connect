import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export function useHotelManagement(businessId?: string | null) {
  const { user } = useAuth();

  const { data: hotel, isLoading: hotelLoading } = useQuery({
    queryKey: ["hotel-management", user?.id, businessId],
    queryFn: async () => {
      if (!user) return null;

      let targetBusinessId = businessId;

      // If no businessId provided, get the primary owned business (or first if no primary)
      if (!targetBusinessId) {
        // Try to get primary business first
        const { data: primaryOwner } = await supabase
          .from("business_owners")
          .select("business_id")
          .eq("user_id", user.id)
          .eq("is_primary", true)
          .maybeSingle();

        if (primaryOwner) {
          targetBusinessId = primaryOwner.business_id;
        } else {
          // Fallback to first business if no primary is set
          const { data: firstOwner } = await supabase
            .from("business_owners")
            .select("business_id")
            .eq("user_id", user.id)
            .limit(1);

          if (!firstOwner || firstOwner.length === 0) return null;
          targetBusinessId = firstOwner[0].business_id;
        }
      }

      // Get business details
      const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", targetBusinessId)
        .single();

      if (!business) return null;

      // Get hotel property details
      const { data: hotelProperty } = await supabase
        .from("hotel_properties")
        .select("*")
        .eq("business_id", business.id)
        .single();

      if (!hotelProperty) return null;

      return {
        ...business,
        hotel_property: hotelProperty,
        id: hotelProperty.id,
      };
    },
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["hotel-stats", hotel?.id],
    queryFn: async () => {
      if (!hotel) return null;

      const today = format(new Date(), "yyyy-MM-dd");

      // Today's arrivals
      const { count: todayArrivals } = await supabase
        .from("hotel_bookings")
        .select("*", { count: "exact", head: true })
        .eq("hotel_id", hotel.id)
        .eq("check_in_date", today)
        .in("status", ["confirmed", "pending"]);

      // Today's departures
      const { count: todayDepartures } = await supabase
        .from("hotel_bookings")
        .select("*", { count: "exact", head: true })
        .eq("hotel_id", hotel.id)
        .eq("check_out_date", today)
        .eq("status", "checked_in");

      // Current occupancy
      const { data: roomTypes } = await supabase
        .from("room_types")
        .select("quantity")
        .eq("hotel_id", hotel.id)
        .eq("is_active", true);

      const totalRooms = roomTypes?.reduce((sum, rt) => sum + rt.quantity, 0) || 0;

      const { data: currentBookings } = await supabase
        .from("hotel_bookings")
        .select("number_of_rooms")
        .eq("hotel_id", hotel.id)
        .eq("status", "checked_in")
        .lte("check_in_date", today)
        .gte("check_out_date", today);

      const occupiedRooms = currentBookings?.reduce((sum, b) => sum + b.number_of_rooms, 0) || 0;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      // Monthly bookings
      const firstDayOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
      const { count: monthlyBookings } = await supabase
        .from("hotel_bookings")
        .select("*", { count: "exact", head: true })
        .eq("hotel_id", hotel.id)
        .gte("created_at", firstDayOfMonth);

      return {
        todayArrivals: todayArrivals || 0,
        todayDepartures: todayDepartures || 0,
        occupancyRate,
        totalRooms,
        occupiedRooms,
        monthlyBookings: monthlyBookings || 0,
      };
    },
    enabled: !!hotel,
  });

  return {
    hotel,
    stats,
    loading: hotelLoading || statsLoading,
  };
}
