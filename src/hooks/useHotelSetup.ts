import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export interface HotelPropertyData {
  star_rating: number;
  check_in_time: string;
  check_out_time: string;
  total_rooms: number;
  wifi_available: boolean;
  parking_available: boolean;
  pool_available: boolean;
  gym_available: boolean;
  spa_available: boolean;
  restaurant_on_site: boolean;
  cancellation_policy: string;
  house_rules: string;
}

export interface RoomTypeData {
  name: string;
  description: string;
  base_price_per_night: number;
  max_occupancy: number;
  quantity: number;
  bed_configuration: string;
  room_size_sqm: number;
  amenities: string[];
}

export function useHotelSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("business");
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch the business to ensure it's a hotel and user owns it
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ["hotel-setup-business", businessId],
    queryFn: async () => {
      if (!businessId || !user) return null;

      const { data, error } = await supabase
        .from("businesses")
        .select("*, business_claims!inner(user_id, status)")
        .eq("id", businessId)
        .eq("business_claims.user_id", user.id)
        .eq("business_claims.status", "approved")
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!businessId && !!user,
  });

  // Check if hotel property already exists
  const { data: existingHotel, isLoading: hotelCheckLoading } = useQuery({
    queryKey: ["existing-hotel-property", businessId],
    queryFn: async () => {
      if (!businessId) return null;

      const { data, error } = await supabase
        .from("hotel_properties")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Create hotel property mutation
  const createHotelProperty = useMutation({
    mutationFn: async (propertyData: HotelPropertyData) => {
      if (!businessId) throw new Error("Business ID is required");

      const { data, error } = await supabase
        .from("hotel_properties")
        .insert({
          business_id: businessId,
          star_rating: propertyData.star_rating,
          check_in_time: propertyData.check_in_time,
          check_out_time: propertyData.check_out_time,
          total_rooms: propertyData.total_rooms,
          wifi_available: propertyData.wifi_available,
          parking_available: propertyData.parking_available,
          pool_available: propertyData.pool_available,
          gym_available: propertyData.gym_available,
          spa_available: propertyData.spa_available,
          restaurant_on_site: propertyData.restaurant_on_site,
          cancellation_policy: propertyData.cancellation_policy,
          house_rules: propertyData.house_rules,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Hotel property details saved!");
      setCurrentStep(2);
    },
    onError: (error) => {
      toast.error(`Failed to save property details: ${error.message}`);
    },
  });

  // Add room type mutation
  const addRoomType = useMutation({
    mutationFn: async ({
      hotelId,
      roomData,
    }: {
      hotelId: string;
      roomData: RoomTypeData;
    }) => {
      const { data, error } = await supabase
        .from("room_types")
        .insert({
          hotel_id: hotelId,
          name: roomData.name,
          description: roomData.description,
          base_price_per_night: roomData.base_price_per_night,
          max_occupancy: roomData.max_occupancy,
          quantity: roomData.quantity,
          bed_configuration: roomData.bed_configuration,
          room_size_sqm: roomData.room_size_sqm,
          amenities: roomData.amenities,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Room type added successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to add room type: ${error.message}`);
    },
  });

  // Complete setup and redirect to hotel dashboard
  const completeSetup = () => {
    toast.success("Hotel setup completed! Redirecting to dashboard...");
    navigate(`/dashboard/hotel?business=${businessId}`);
  };

  return {
    business,
    businessId,
    existingHotel,
    currentStep,
    setCurrentStep,
    isLoading: businessLoading || hotelCheckLoading,
    createHotelProperty,
    addRoomType,
    completeSetup,
  };
}
