import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, Phone, Mail, Wifi, Car, UtensilsCrossed, Waves, Dumbbell, Sparkles, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import RoomTypeCard from "@/components/hotels/RoomTypeCard";
import BookingWidget from "@/components/hotels/BookingWidget";
import { Skeleton } from "@/components/ui/skeleton";

const HotelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preSelectedRoom = searchParams.get("selectRoom") || undefined;

  const { data: hotel, isLoading } = useQuery({
    queryKey: ["hotel", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_properties")
        .select(`
          *,
          business:businesses!inner (
            id,
            name,
            description,
            image_url,
            gallery_images,
            region,
            address,
            phone,
            email,
            website,
            rating,
            review_count,
            latitude,
            longitude
          ),
          room_types!inner (
            *
          ),
          hotel_amenities (
            *
          )
        `)
        .eq("id", id)
        .eq("room_types.is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Hotel Not Found</h2>
        <p className="text-muted-foreground">The hotel you're looking for doesn't exist.</p>
      </div>
    );
  }

  const amenityIcons: Record<string, any> = {
    WiFi: Wifi,
    Parking: Car,
    Restaurant: UtensilsCrossed,
    Pool: Waves,
    Gym: Dumbbell,
    Spa: Sparkles,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-primary/20 to-secondary/20">
        <img
          src={hotel.business.image_url || "/placeholder.svg"}
          alt={hotel.business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary text-primary-foreground">
                {hotel.star_rating} <Star className="w-3 h-3 ml-1 fill-current" />
              </Badge>
              {hotel.business.rating > 0 && (
                <div className="flex items-center gap-1 text-foreground">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-semibold">{hotel.business.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({hotel.business.review_count} reviews)
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{hotel.business.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{hotel.business.address || hotel.business.region}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hotel Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>About This Hotel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {hotel.business.description || "Experience comfort and luxury at our hotel."}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.wifi_available && (
                    <div className="flex items-center gap-2">
                      <Wifi className="w-5 h-5 text-primary" />
                      <span>Free WiFi</span>
                    </div>
                  )}
                  {hotel.parking_available && (
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-primary" />
                      <span>Parking</span>
                    </div>
                  )}
                  {hotel.restaurant_on_site && (
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-primary" />
                      <span>Restaurant</span>
                    </div>
                  )}
                  {hotel.pool_available && (
                    <div className="flex items-center gap-2">
                      <Waves className="w-5 h-5 text-primary" />
                      <span>Swimming Pool</span>
                    </div>
                  )}
                  {hotel.gym_available && (
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-primary" />
                      <span>Fitness Center</span>
                    </div>
                  )}
                  {hotel.spa_available && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span>Spa & Wellness</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Check-in/out Times */}
            <Card>
              <CardHeader>
                <CardTitle>Important Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Check-in: {hotel.check_in_time}</p>
                    <p className="font-semibold">Check-out: {hotel.check_out_time}</p>
                  </div>
                </div>
                {hotel.cancellation_policy && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                      <p className="text-sm text-muted-foreground">{hotel.cancellation_policy}</p>
                    </div>
                  </>
                )}
                {hotel.house_rules && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">House Rules</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{hotel.house_rules}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Room Types */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Available Rooms</h2>
              {hotel.room_types.map((room: any) => (
                <RoomTypeCard key={room.id} room={room} hotelId={hotel.id} />
              ))}
            </div>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hotel.business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{hotel.business.phone}</span>
                  </div>
                )}
                {hotel.business.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>{hotel.business.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:sticky lg:top-4 h-fit">
            <BookingWidget hotelId={hotel.id} roomTypes={hotel.room_types} preSelectedRoom={preSelectedRoom} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
