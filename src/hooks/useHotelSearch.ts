import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HotelSearchParams {
  region?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  searchQuery?: string;
}

export const useHotelSearch = (params: HotelSearchParams) => {
  return useQuery({
    queryKey: ["hotels", params],
    queryFn: async () => {
      let query = supabase
        .from("hotel_properties")
        .select(`
          *,
          business:businesses!inner (
            id,
            name,
            image_url,
            region,
            rating,
            review_count,
            description,
            category
          ),
          room_types!inner (
            id,
            name,
            base_price_per_night,
            max_occupancy,
            is_active
          )
        `)
        .eq("room_types.is_active", true);

      // Filter by region
      if (params.region) {
        query = query.eq("business.region", params.region);
      }

      // Filter by search query
      if (params.searchQuery) {
        query = query.ilike("business.name", `%${params.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by guests if provided
      let filteredData = data;
      if (params.guests) {
        filteredData = data?.filter((hotel: any) =>
          hotel.room_types.some((room: any) => room.max_occupancy >= params.guests)
        );
      }

      return filteredData;
    },
    enabled: true,
  });
};
