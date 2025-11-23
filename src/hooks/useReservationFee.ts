import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReservationFeeResult {
  reservationFee: number;
  balanceDue: number;
  feeEnabled: boolean;
}

export function useReservationFee(hotelId: string | undefined, totalPrice: number) {
  return useQuery({
    queryKey: ["reservation-fee", hotelId, totalPrice],
    queryFn: async (): Promise<ReservationFeeResult> => {
      if (!hotelId || totalPrice <= 0) {
        return { reservationFee: totalPrice, balanceDue: 0, feeEnabled: false };
      }

      const { data, error } = await supabase.rpc("calculate_reservation_fee", {
        p_hotel_id: hotelId,
        p_total_price: totalPrice,
      });

      if (error) {
        console.error("Error calculating reservation fee:", error);
        return { reservationFee: totalPrice, balanceDue: 0, feeEnabled: false };
      }

      return {
        reservationFee: data[0]?.reservation_fee || totalPrice,
        balanceDue: data[0]?.balance_due || 0,
        feeEnabled: data[0]?.fee_enabled || false,
      };
    },
    enabled: !!hotelId && totalPrice > 0,
  });
}
