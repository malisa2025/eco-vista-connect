import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUserReservations, useReservationMutations } from "@/hooks/useRestaurantReservations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, parseISO, isPast, isToday } from "date-fns";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Utensils,
  X,
  CheckCircle,
  AlertCircle,
  Building2,
} from "lucide-react";

const MyReservations = () => {
  const navigate = useNavigate();
  const { data: reservations, isLoading } = useUserReservations();
  const { cancelReservation } = useReservationMutations();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const getStatusBadge = (status: string, date: string) => {
    const reservationDate = parseISO(date);
    const isPastReservation = isPast(reservationDate) && !isToday(reservationDate);

    if (isPastReservation && status !== "cancelled") {
      return (
        <Badge variant="secondary">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }

    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const upcomingReservations = reservations?.filter((r) => {
    const reservationDate = parseISO(r.reservation_date);
    return (
      (!isPast(reservationDate) || isToday(reservationDate)) &&
      r.status !== "cancelled"
    );
  });

  const pastReservations = reservations?.filter((r) => {
    const reservationDate = parseISO(r.reservation_date);
    return isPast(reservationDate) && !isToday(reservationDate);
  });

  const cancelledReservations = reservations?.filter((r) => r.status === "cancelled");

  const handleCancel = async () => {
    if (cancellingId) {
      await cancelReservation.mutateAsync({ id: cancellingId });
      setCancellingId(null);
    }
  };

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Restaurant Image */}
          <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
            {reservation.businesses?.image_url ? (
              <img
                src={reservation.businesses.image_url}
                alt={reservation.businesses.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Utensils className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <h3
                  className="font-semibold text-lg hover:text-primary cursor-pointer"
                  onClick={() => navigate(`/businesses/${reservation.business_id}`)}
                >
                  {reservation.businesses?.name || "Restaurant"}
                </h3>
                <p className="text-sm font-mono text-muted-foreground">
                  Ref: {reservation.booking_reference}
                </p>
              </div>
              {getStatusBadge(reservation.status, reservation.reservation_date)}
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(parseISO(reservation.reservation_date), "EEEE, MMMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {reservation.reservation_time.slice(0, 5)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                {reservation.party_size} {reservation.party_size === 1 ? "guest" : "guests"}
              </div>
              {reservation.businesses?.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{reservation.businesses.address}</span>
                </div>
              )}
            </div>

            {reservation.occasion && (
              <Badge variant="secondary">{reservation.occasion}</Badge>
            )}

            {reservation.special_requests && (
              <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
                "{reservation.special_requests}"
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {reservation.businesses?.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${reservation.businesses.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/businesses/${reservation.business_id}`)}
              >
                <Building2 className="h-4 w-4 mr-2" />
                View Restaurant
              </Button>
              {reservation.status !== "cancelled" &&
                (!isPast(parseISO(reservation.reservation_date)) ||
                  isToday(parseISO(reservation.reservation_date))) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setCancellingId(reservation.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Reservations</h1>
            <p className="text-muted-foreground">Manage your restaurant reservations</p>
          </div>
        </div>

        {!reservations || reservations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Utensils className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reservations yet</h3>
              <p className="text-muted-foreground mb-4">
                Browse restaurants and make your first reservation
              </p>
              <Button onClick={() => navigate("/businesses")}>
                Browse Restaurants
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingReservations?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastReservations?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({cancelledReservations?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingReservations?.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No upcoming reservations
                  </CardContent>
                </Card>
              ) : (
                upcomingReservations?.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastReservations?.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No past reservations
                  </CardContent>
                </Card>
              ) : (
                pastReservations?.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledReservations?.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No cancelled reservations
                  </CardContent>
                </Card>
              ) : (
                cancelledReservations?.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyReservations;
