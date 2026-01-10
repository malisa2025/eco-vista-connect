import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useBusinessReservations, useReservationMutations } from "@/hooks/useRestaurantReservations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import {
  ArrowLeft,
  MoreHorizontal,
  Check,
  X,
  Clock,
  Users,
  Calendar,
  Utensils,
  Phone,
  Mail,
} from "lucide-react";

const RestaurantReservations = () => {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const { data: reservations, isLoading } = useBusinessReservations(businessId!);
  const { updateReservationStatus, cancelReservation } = useReservationMutations();

  // Get business info
  const { data: business } = useQuery({
    queryKey: ["business", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const todayReservations = reservations?.filter((r) => 
    isToday(parseISO(r.reservation_date)) && r.status !== "cancelled"
  );
  
  const upcomingReservations = reservations?.filter((r) => {
    const date = parseISO(r.reservation_date);
    return !isPast(date) && !isToday(date) && r.status !== "cancelled";
  });
  
  const pastReservations = reservations?.filter((r) => 
    isPast(parseISO(r.reservation_date)) && !isToday(parseISO(r.reservation_date))
  );

  const pendingCount = reservations?.filter((r) => r.status === "pending").length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const ReservationTable = ({ data }: { data: typeof reservations }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Guest</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Party</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((reservation) => (
          <TableRow key={reservation.id}>
            <TableCell>
              <div>
                <div className="font-medium">{reservation.guest_name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {reservation.guest_email}
                </div>
                {reservation.guest_phone && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {reservation.guest_phone}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{getDateLabel(reservation.reservation_date)}</div>
                  <div className="text-sm text-muted-foreground">
                    {reservation.reservation_time.slice(0, 5)}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                {reservation.party_size}
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
            <TableCell>
              <div className="text-sm space-y-1">
                {reservation.occasion && (
                  <Badge variant="outline">{reservation.occasion}</Badge>
                )}
                {reservation.table_preference && (
                  <div className="text-muted-foreground">{reservation.table_preference}</div>
                )}
                {reservation.special_requests && (
                  <div className="text-muted-foreground italic">"{reservation.special_requests}"</div>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {reservation.status === "pending" && (
                    <>
                      <DropdownMenuItem
                        onClick={() => updateReservationStatus.mutate({
                          id: reservation.id,
                          status: "confirmed"
                        })}
                      >
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Confirm
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => cancelReservation.mutate({ id: reservation.id })}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </DropdownMenuItem>
                    </>
                  )}
                  {reservation.status === "confirmed" && (
                    <>
                      <DropdownMenuItem
                        onClick={() => updateReservationStatus.mutate({
                          id: reservation.id,
                          status: "completed"
                        })}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => cancelReservation.mutate({ id: reservation.id })}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    </>
                  )}
                  {reservation.guest_phone && (
                    <DropdownMenuItem asChild>
                      <a href={`tel:${reservation.guest_phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Guest
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <a href={`mailto:${reservation.guest_email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email Guest
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Utensils className="h-8 w-8" />
              Reservations
            </h1>
            <p className="text-muted-foreground">{business?.name}</p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              {pendingCount} Pending
            </Badge>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayReservations?.length || 0}</div>
              <p className="text-sm text-muted-foreground">reservations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingReservations?.length || 0}</div>
              <p className="text-sm text-muted-foreground">reservations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-sm text-muted-foreground">need action</p>
            </CardContent>
          </Card>
        </div>

        {!reservations || reservations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Utensils className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reservations yet</h3>
              <p className="text-muted-foreground">
                Reservations will appear here when customers book a table
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="today" className="space-y-4">
            <TabsList>
              <TabsTrigger value="today">
                Today ({todayReservations?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingReservations?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastReservations?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today">
              <Card>
                <CardContent className="pt-6">
                  {todayReservations?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No reservations for today
                    </p>
                  ) : (
                    <ReservationTable data={todayReservations} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming">
              <Card>
                <CardContent className="pt-6">
                  {upcomingReservations?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No upcoming reservations
                    </p>
                  ) : (
                    <ReservationTable data={upcomingReservations} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past">
              <Card>
                <CardContent className="pt-6">
                  {pastReservations?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      No past reservations
                    </p>
                  ) : (
                    <ReservationTable data={pastReservations} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RestaurantReservations;
