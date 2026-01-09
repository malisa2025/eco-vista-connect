import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotelManagement } from "@/hooks/useHotelManagement";
import { useHotelBookings } from "@/hooks/useHotelBookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye, Calendar, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function HotelBookings() {
  const navigate = useNavigate();
  const { hotel, loading: hotelLoading } = useHotelManagement();
  const { bookings, loading, updateStatus } = useHotelBookings(hotel?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  if (hotelLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!hotel) {
    navigate("/dashboard/hotel/setup");
    return null;
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const handleUpdateStatus = async (bookingId: string, newStatus: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled") => {
    try {
      await updateStatus.mutateAsync({ bookingId, status: newStatus });
      toast.success(`Booking status updated to ${newStatus}`);
      setSelectedBooking(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update booking status");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings Manager</h1>
        <p className="text-muted-foreground">View and manage all hotel bookings</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name, email, or booking reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Bookings will appear here once guests make reservations"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.booking_reference}</TableCell>
                      <TableCell>{booking.guest_name}</TableCell>
                      <TableCell>{booking.room_types?.name}</TableCell>
                      <TableCell>{format(new Date(booking.check_in_date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{format(new Date(booking.check_out_date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{booking.number_of_guests}</TableCell>
                      <TableCell>GH₵ {booking.total_price}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>View reservation details and guest information</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Reference</p>
                  <p className="font-medium">{selectedBooking.booking_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Guest Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{selectedBooking.guest_name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedBooking.guest_email}`} className="text-primary hover:underline">
                      {selectedBooking.guest_email}
                    </a>
                  </div>
                  {selectedBooking.guest_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedBooking.guest_phone}`} className="text-primary hover:underline">
                        {selectedBooking.guest_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Room Type</p>
                    <p className="font-medium">{selectedBooking.room_types?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Number of Rooms</p>
                    <p className="font-medium">{selectedBooking.number_of_rooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-medium">{format(new Date(selectedBooking.check_in_date), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check-out</p>
                    <p className="font-medium">{format(new Date(selectedBooking.check_out_date), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Guests</p>
                    <p className="font-medium">{selectedBooking.number_of_guests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nights</p>
                    <p className="font-medium">{selectedBooking.number_of_nights}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Special Requests</h4>
                  <p className="text-sm text-muted-foreground">{selectedBooking.special_requests}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Total Amount</p>
                  <p className="text-2xl font-bold">GH₵ {selectedBooking.total_price}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Payment Status: {selectedBooking.payment_status}
                </p>
              </div>

              <div className="border-t pt-4 flex gap-2 flex-wrap">
                {selectedBooking.status === "pending" && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed")}
                    disabled={updateStatus.isPending}
                  >
                    Confirm Booking
                  </Button>
                )}
                {selectedBooking.status === "confirmed" && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "checked_in")}
                    disabled={updateStatus.isPending}
                  >
                    Check In
                  </Button>
                )}
                {selectedBooking.status === "checked_in" && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "checked_out")}
                    disabled={updateStatus.isPending}
                  >
                    Check Out
                  </Button>
                )}
                {["pending", "confirmed"].includes(selectedBooking.status) && (
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled")}
                    disabled={updateStatus.isPending}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
