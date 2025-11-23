import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Phone, Mail, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyBookings = () => {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("hotel_bookings")
        .select(`
          *,
          hotel:hotel_properties!inner (
            *,
            business:businesses!inner (*)
          ),
          room_type:room_types!inner (*)
        `)
        .or(`user_id.eq.${user.id},guest_email.eq.${user.email}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "checked_in":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "checked_out":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted";
    }
  };

  const filterBookings = (status: string) => {
    if (!bookings) return [];
    
    if (status === "upcoming") {
      return bookings.filter((b: any) => 
        ["confirmed", "pending"].includes(b.status) && 
        new Date(b.check_in_date) >= new Date()
      );
    }
    if (status === "past") {
      return bookings.filter((b: any) => 
        b.status === "checked_out" || 
        (new Date(b.check_out_date) < new Date() && b.status !== "cancelled")
      );
    }
    if (status === "cancelled") {
      return bookings.filter((b: any) => b.status === "cancelled");
    }
    return bookings;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="text-muted-foreground">You need to be signed in to view your bookings.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Hotel Image */}
          <div className="md:col-span-1">
            <img
              src={booking.hotel.business.image_url || "/placeholder.svg"}
              alt={booking.hotel.business.name}
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>

          {/* Booking Details */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{booking.hotel.business.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.hotel.business.region}</span>
                </div>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">Check-in:</span>
                  <span>{format(new Date(booking.check_in_date), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">Check-out:</span>
                  <span>{format(new Date(booking.check_out_date), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {booking.number_of_guests} guest{booking.number_of_guests > 1 ? "s" : ""}, {booking.number_of_rooms} room{booking.number_of_rooms > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-medium">Booking Ref:</span>
                  <span className="font-mono text-xs">{booking.booking_reference}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{booking.guest_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{booking.guest_email}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Room Type</p>
                <p className="font-semibold">{booking.room_type.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">GH₵{booking.total_price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {bookings && bookings.length > 0 ? (
            bookings.map((booking: any) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No bookings found.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {filterBookings("upcoming").length > 0 ? (
            filterBookings("upcoming").map((booking: any) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No upcoming bookings.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filterBookings("past").length > 0 ? (
            filterBookings("past").map((booking: any) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No past bookings.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filterBookings("cancelled").length > 0 ? (
            filterBookings("cancelled").map((booking: any) => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No cancelled bookings.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyBookings;
