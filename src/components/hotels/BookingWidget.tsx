import { useState } from "react";
import { Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BookingWidgetProps {
  hotelId: string;
  roomTypes: Array<{
    id: string;
    name: string;
    base_price_per_night: number;
    max_occupancy: number;
  }>;
}

const BookingWidget = ({ hotelId, roomTypes }: BookingWidgetProps) => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [guests, setGuests] = useState("2");
  const [rooms, setRooms] = useState("1");

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !selectedRoom) return 0;
    
    const nights = differenceInDays(checkOut, checkIn);
    const room = roomTypes.find((r) => r.id === selectedRoom);
    
    if (!room || nights <= 0) return 0;
    
    return room.base_price_per_night * nights * parseInt(rooms);
  };

  const handleReserve = () => {
    if (!checkIn || !checkOut || !selectedRoom) {
      toast.error("Please fill in all booking details");
      return;
    }

    const nights = differenceInDays(checkOut, checkIn);
    if (nights <= 0) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    // Navigate to booking page with pre-filled data
    const params = new URLSearchParams({
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      room: selectedRoom,
      guests,
      rooms,
    });
    navigate(`/hotels/${hotelId}/book?${params.toString()}`);
  };

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const total = calculateTotal();

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Room Selection */}
        <div>
          <Label>Room Type</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger>
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} - GH₵{room.base_price_per_night}/night
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Check-in */}
        <div>
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Check-in
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {checkIn ? format(checkIn, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div>
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Check-out
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {checkOut ? format(checkOut, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => !checkIn || date <= checkIn}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div>
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Guests
          </Label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Guest{num > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Number of Rooms */}
        <div>
          <Label>Number of Rooms</Label>
          <Select value={rooms} onValueChange={setRooms}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} Room{num > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Summary */}
        {nights > 0 && selectedRoom && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>{nights} night{nights > 1 ? "s" : ""}</span>
              <span>x {rooms} room{parseInt(rooms) > 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t">
              <span className="font-semibold">Total</span>
              <div className="text-right">
                <p className="text-2xl font-bold">GH₵{total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Taxes included</p>
              </div>
            </div>
          </div>
        )}

        {/* Reserve Button */}
        <Button onClick={handleReserve} className="w-full" size="lg">
          Reserve Now
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You won't be charged yet
        </p>
      </CardContent>
    </Card>
  );
};

export default BookingWidget;
