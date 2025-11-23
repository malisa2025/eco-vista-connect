import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Hotel, Users, DollarSign, TrendingUp } from "lucide-react";
import { useHotelManagement } from "@/hooks/useHotelManagement";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function HotelDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hotel, stats, loading } = useHotelManagement();
  const [todayArrivals, setTodayArrivals] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !hotel) {
      navigate("/dashboard/hotel/setup");
    }
  }, [hotel, loading, navigate]);

  useEffect(() => {
    if (hotel) {
      fetchTodayArrivals();
      fetchRecentBookings();
    }
  }, [hotel]);

  const fetchTodayArrivals = async () => {
    if (!hotel) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const { data } = await supabase
      .from("hotel_bookings")
      .select(`
        *,
        room_types (name)
      `)
      .eq("hotel_id", hotel.id)
      .eq("check_in_date", today)
      .in("status", ["confirmed", "pending"])
      .order("created_at", { ascending: false });

    setTodayArrivals(data || []);
  };

  const fetchRecentBookings = async () => {
    if (!hotel) return;

    const { data } = await supabase
      .from("hotel_bookings")
      .select(`
        *,
        room_types (name)
      `)
      .eq("hotel_id", hotel.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentBookings(data || []);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!hotel) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "checked_in":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "checked_out":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{hotel.name} - Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your hotel overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Arrivals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayArrivals || 0}</div>
            <p className="text-xs text-muted-foreground">Check-ins expected today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Departures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayDepartures || 0}</div>
            <p className="text-xs text-muted-foreground">Check-outs expected today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.occupancyRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.occupiedRooms || 0} of {stats?.totalRooms || 0} rooms occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlyBookings || 0}</div>
            <p className="text-xs text-muted-foreground">Total bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Arrivals */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Arrivals</CardTitle>
        </CardHeader>
        <CardContent>
          {todayArrivals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No arrivals expected today</p>
          ) : (
            <div className="space-y-4">
              {todayArrivals.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{booking.guest_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.room_types?.name} • {booking.number_of_rooms} room(s) • {booking.number_of_guests} guest(s)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ref: {booking.booking_reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent bookings</p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{booking.guest_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.room_types?.name} • {format(new Date(booking.check_in_date), "MMM dd")} - {format(new Date(booking.check_out_date), "MMM dd, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ref: {booking.booking_reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">GH₵ {booking.total_price}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
