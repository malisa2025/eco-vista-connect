import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Calendar,
  UtensilsCrossed,
  Users,
  Clock,
  ArrowRight,
  Edit,
  Plus,
  Star,
  Eye,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { format, isToday, parseISO, startOfMonth, endOfMonth } from "date-fns";

export default function RestaurantDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch business details
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ["restaurant-dashboard", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch restaurant stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["restaurant-stats", id],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

      // Today's reservations
      const { count: todayReservations } = await supabase
        .from("restaurant_reservations")
        .select("*", { count: "exact", head: true })
        .eq("business_id", id)
        .eq("reservation_date", today)
        .in("status", ["pending", "confirmed"]);

      // This month's reservations
      const { count: monthlyReservations } = await supabase
        .from("restaurant_reservations")
        .select("*", { count: "exact", head: true })
        .eq("business_id", id)
        .gte("reservation_date", monthStart)
        .lte("reservation_date", monthEnd);

      // Menu items count
      const { count: menuItemsCount } = await supabase
        .from("business_menu_items")
        .select("*", { count: "exact", head: true })
        .eq("business_id", id);

      // Featured items count
      const { count: featuredItemsCount } = await supabase
        .from("business_menu_items")
        .select("*", { count: "exact", head: true })
        .eq("business_id", id)
        .eq("is_featured", true);

      // Menu categories
      const { data: categories } = await supabase
        .from("business_menu_items")
        .select("category")
        .eq("business_id", id);

      const uniqueCategories = new Set(categories?.map((c) => c.category) || []);

      return {
        todayReservations: todayReservations || 0,
        monthlyReservations: monthlyReservations || 0,
        menuItemsCount: menuItemsCount || 0,
        featuredItemsCount: featuredItemsCount || 0,
        categoriesCount: uniqueCategories.size,
      };
    },
    enabled: !!id,
  });

  // Fetch recent reservations
  const { data: recentReservations } = useQuery({
    queryKey: ["restaurant-recent-reservations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_reservations")
        .select("*")
        .eq("business_id", id)
        .order("reservation_date", { ascending: true })
        .order("reservation_time", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch today's reservations
  const { data: todayReservationsList } = useQuery({
    queryKey: ["restaurant-today-reservations", id],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("restaurant_reservations")
        .select("*")
        .eq("business_id", id)
        .eq("reservation_date", today)
        .in("status", ["pending", "confirmed"])
        .order("reservation_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const isLoading = businessLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
            <Button onClick={() => navigate("/my-businesses")}>
              Back to My Businesses
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const quickActions = [
    {
      title: "Manage Menu",
      description: "Add/edit items",
      icon: UtensilsCrossed,
      href: `/dashboard/menu/${id}`,
      color: "text-orange-500",
    },
    {
      title: "Reservations",
      description: "View bookings",
      icon: Calendar,
      href: `/dashboard/reservations/${id}`,
      color: "text-green-500",
    },
    {
      title: "Edit Profile",
      description: "Update info",
      icon: Edit,
      href: `/businesses/${id}/edit`,
      color: "text-blue-500",
    },
    {
      title: "View Page",
      description: "Public profile",
      icon: Eye,
      href: `/businesses/${id}`,
      color: "text-pink-500",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-background border flex items-center justify-center overflow-hidden">
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{business.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">Restaurant</Badge>
                  <Badge variant="outline">{business.region}</Badge>
                  {business.is_verified && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/dashboard/business/${id}`)}>
                Full Dashboard
              </Button>
              <Button onClick={() => navigate(`/dashboard/menu/${id}`)}>
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Manage Menu
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Reservations</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayReservations || 0}</div>
                <p className="text-xs text-muted-foreground">Bookings for today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Reservations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.monthlyReservations || 0}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.menuItemsCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.featuredItemsCount || 0} featured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {business.rating ? business.rating.toFixed(1) : "0.0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {business.review_count || 0} reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your restaurant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto flex-col py-4 px-3 gap-2"
                    onClick={() => navigate(action.href)}
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Today's Reservations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Today's Reservations</CardTitle>
                  <CardDescription>Upcoming bookings for today</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/dashboard/reservations/${id}`)}
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {!todayReservationsList || todayReservationsList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No reservations for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayReservationsList.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{reservation.guest_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {reservation.reservation_time}
                            <Users className="h-3 w-3 ml-2" />
                            {reservation.party_size} guests
                          </div>
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reservations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Reservations</CardTitle>
                  <CardDescription>Next scheduled bookings</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/dashboard/reservations/${id}`)}
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {!recentReservations || recentReservations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No upcoming reservations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{reservation.guest_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(parseISO(reservation.reservation_date), "MMM dd, yyyy")}
                            <Clock className="h-3 w-3 ml-2" />
                            {reservation.reservation_time}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(reservation.status)}>
                            {reservation.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {reservation.party_size} guests
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
