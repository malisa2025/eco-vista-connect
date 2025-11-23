import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useReservationFee } from "@/hooks/useReservationFee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { format, differenceInDays } from "date-fns";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PaystackButton } from "react-paystack";

const HotelBooking = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const checkIn = searchParams.get("checkIn") ? new Date(searchParams.get("checkIn")!) : null;
  const checkOut = searchParams.get("checkOut") ? new Date(searchParams.get("checkOut")!) : null;
  const roomTypeId = searchParams.get("room");
  const guests = parseInt(searchParams.get("guests") || "2");
  const rooms = parseInt(searchParams.get("rooms") || "1");

  const { data: hotel } = useQuery({
    queryKey: ["hotel", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_properties")
        .select(`
          *,
          business:businesses!inner (*),
          room_types!inner (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const selectedRoom = hotel?.room_types.find((r: any) => r.id === roomTypeId);
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = selectedRoom ? selectedRoom.base_price_per_night * nights * rooms : 0;
  const total = subtotal;
  
  const { data: feeData } = useReservationFee(hotel?.id, total);
  const reservationFee = feeData?.reservationFee || total;
  const balanceDue = feeData?.balanceDue || 0;
  const feeEnabled = feeData?.feeEnabled || false;

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setGuestName(data.full_name || "");
            setGuestEmail(data.email || user.email || "");
            setGuestPhone(data.phone || "");
          }
        });
    }
  }, [user]);

  const handleCreateBooking = async (paymentReference: string) => {
    if (!checkIn || !checkOut || !selectedRoom || !hotel) {
      toast.error("Missing booking information");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate booking reference
      const { data: refData } = await supabase.rpc("generate_booking_reference");
      const bookingReference = refData;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("hotel_bookings")
        .insert({
          booking_reference: bookingReference,
          hotel_id: hotel.id,
          room_type_id: selectedRoom.id,
          user_id: user?.id,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          check_in_date: format(checkIn, "yyyy-MM-dd"),
          check_out_date: format(checkOut, "yyyy-MM-dd"),
          number_of_rooms: rooms,
          number_of_guests: guests,
          number_of_nights: nights,
          total_price: total,
          reservation_fee_amount: reservationFee,
          balance_due: balanceDue,
          deposit_paid_at: new Date().toISOString(),
          status: "confirmed",
          payment_status: balanceDue > 0 ? "partial" : "paid",
          payment_reference: paymentReference,
          special_requests: specialRequests,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      toast.success("Booking confirmed!");
      navigate(`/my-bookings?booking=${booking.id}`);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setIsProcessing(false);
    }
  };

  const paystackConfig = {
    email: guestEmail,
    amount: Math.round(reservationFee * 100), // Convert to pesewas (charge only reservation fee)
    publicKey: "pk_test_4e0fc2b1b9aad7f84b0ec18e9c8c14872b3ad1a5",
    metadata: {
      hotel_id: id,
      room_type_id: roomTypeId,
      custom_fields: [
        {
          display_name: "Hotel Booking",
          variable_name: "booking_type",
          value: "hotel",
        },
      ],
    },
    onSuccess: (reference: any) => {
      handleCreateBooking(reference.reference);
    },
    onClose: () => {
      toast.error("Payment cancelled");
    },
  };

  if (!hotel || !selectedRoom || !checkIn || !checkOut) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Invalid Booking</h2>
        <p className="text-muted-foreground mb-4">Please select a room and dates to proceed.</p>
        <Button onClick={() => navigate(`/hotels/${id}`)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Guest Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+233 XX XXX XXXX"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Special Requests (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or requests..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">{hotel.business.name}</h4>
                    <p className="text-sm text-muted-foreground">{hotel.business.region}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room</span>
                      <span className="font-medium">{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in</span>
                      <span className="font-medium">{format(checkIn, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out</span>
                      <span className="font-medium">{format(checkOut, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests</span>
                      <span className="font-medium">{guests} guest{guests > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rooms</span>
                      <span className="font-medium">{rooms} room{rooms > 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        GH₵{selectedRoom.base_price_per_night} x {nights} night{nights > 1 ? "s" : ""} x {rooms} room{rooms > 1 ? "s" : ""}
                      </span>
                      <span className="font-medium">GH₵{subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total Booking Cost</span>
                      <span className="font-bold text-2xl">GH₵{total.toFixed(2)}</span>
                    </div>
                    
                    {feeEnabled && balanceDue > 0 && (
                      <>
                        <div className="pt-2 space-y-2 text-sm">
                          <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
                            <span className="font-medium">Paying Now (Deposit):</span>
                            <span className="font-bold text-primary">GH₵{reservationFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="font-medium">Balance Due:</span>
                            <span className="font-semibold">GH₵{balanceDue.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground pt-1">
                            ✓ Pay remaining balance at check-in
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <PaystackButton
                    {...paystackConfig}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-md font-medium inline-flex items-center justify-center disabled:opacity-50"
                    disabled={!guestName || !guestEmail || !guestPhone || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {feeEnabled && balanceDue > 0 
                          ? `Confirm & Pay GH₵${reservationFee.toFixed(2)}`
                          : "Confirm & Pay Full"
                        }
                      </>
                    )}
                  </PaystackButton>

                  <p className="text-xs text-center text-muted-foreground">
                    Payment secured by Paystack
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBooking;
