import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useReservationMutations } from "@/hooks/useRestaurantReservations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, Utensils, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReservationWidgetProps {
  businessId: string;
  businessName: string;
}

const timeSlots = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00"
];

const partySizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const occasions = [
  "Birthday",
  "Anniversary",
  "Business Meeting",
  "Date Night",
  "Family Gathering",
  "Other"
];

const tablePreferences = [
  "No preference",
  "Window seat",
  "Outdoor",
  "Private area",
  "Near bar"
];

const ReservationWidget = ({ businessId, businessName }: ReservationWidgetProps) => {
  const { user, profile } = useAuth();
  const { createReservation } = useReservationMutations();
  
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [guestName, setGuestName] = useState(profile?.full_name || "");
  const [guestEmail, setGuestEmail] = useState(profile?.email || user?.email || "");
  const [guestPhone, setGuestPhone] = useState(profile?.phone || "");
  const [occasion, setOccasion] = useState("");
  const [tablePreference, setTablePreference] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedReference, setSubmittedReference] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !guestName || !guestEmail) {
      return;
    }

    try {
      const result = await createReservation.mutateAsync({
        business_id: businessId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || undefined,
        reservation_date: format(date, "yyyy-MM-dd"),
        reservation_time: time,
        party_size: parseInt(partySize),
        occasion: occasion || undefined,
        table_preference: tablePreference === "No preference" ? undefined : tablePreference,
        special_requests: specialRequests || undefined,
      });
      
      setIsSubmitted(true);
      setSubmittedReference(result.booking_reference);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Reservation Submitted!</h3>
            <p className="text-muted-foreground">
              Your reservation at <strong>{businessName}</strong> has been submitted.
            </p>
            <div className="bg-background rounded-lg p-4 inline-block">
              <p className="text-sm text-muted-foreground">Reference Number</p>
              <p className="text-lg font-mono font-bold">{submittedReference}</p>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{format(date!, "EEEE, MMMM d, yyyy")} at {time}</p>
              <p>{partySize} {parseInt(partySize) === 1 ? "guest" : "guests"}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll receive a confirmation email shortly.
            </p>
            <Button variant="outline" onClick={() => {
              setIsSubmitted(false);
              setDate(undefined);
              setTime("");
              setShowDetails(false);
            }}>
              Make Another Reservation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Make a Reservation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    isBefore(date, startOfDay(new Date())) ||
                    isBefore(addDays(new Date(), 60), date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Party Size */}
          <div className="space-y-2">
            <Label>Party Size</Label>
            <Select value={partySize} onValueChange={setPartySize}>
              <SelectTrigger>
                <Users className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {partySizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} {size === 1 ? "guest" : "guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show more details */}
          {!showDetails && date && time && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowDetails(true)}
            >
              Continue
            </Button>
          )}

          {showDetails && (
            <>
              <div className="border-t pt-4 space-y-4">
                {/* Guest Details */}
                <div className="space-y-2">
                  <Label htmlFor="guestName">Your Name *</Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Phone</Label>
                  <Input
                    id="guestPhone"
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>

                {/* Optional Details */}
                <div className="space-y-2">
                  <Label>Occasion (optional)</Label>
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Table Preference (optional)</Label>
                  <Select value={tablePreference} onValueChange={setTablePreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {tablePreferences.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests (optional)</Label>
                  <Textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any dietary requirements, allergies, or special requests..."
                    rows={3}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!date || !time || !guestName || !guestEmail || createReservation.isPending}
              >
                {createReservation.isPending ? "Submitting..." : "Complete Reservation"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By making a reservation, you agree to the restaurant's cancellation policy.
              </p>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ReservationWidget;
