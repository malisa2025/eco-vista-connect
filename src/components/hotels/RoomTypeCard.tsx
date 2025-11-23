import { Users, Maximize, Bed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoomTypeCardProps {
  room: {
    id: string;
    name: string;
    description: string;
    max_occupancy: number;
    bed_configuration: string;
    room_size_sqm: number;
    base_price_per_night: number;
    images: string[];
    amenities: string[];
  };
  hotelId: string;
}

const RoomTypeCard = ({ room, hotelId }: RoomTypeCardProps) => {
  const handleBookNow = () => {
    // Navigate to booking page with room selected
    window.location.href = `/hotels/${hotelId}/book?room=${room.id}`;
  };

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Room Image */}
        <div className="md:col-span-1">
          <img
            src={room.images?.[0] || "/placeholder.svg"}
            alt={room.name}
            className="w-full h-full object-cover min-h-[200px]"
          />
        </div>

        {/* Room Info */}
        <CardContent className="md:col-span-2 p-4 md:p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold mb-1">{room.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
            </div>
          </div>

          {/* Room Details */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Up to {room.max_occupancy} guests</span>
            </div>
            {room.bed_configuration && (
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-primary" />
                <span>{room.bed_configuration}</span>
              </div>
            )}
            {room.room_size_sqm && (
              <div className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-primary" />
                <span>{room.room_size_sqm} m²</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {room.amenities.slice(0, 4).map((amenity: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {room.amenities.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{room.amenities.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {/* Price and CTA */}
          <div className="flex justify-between items-end pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-2xl font-bold">
                GH₵{room.base_price_per_night.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/night</span>
              </p>
            </div>
            <Button onClick={handleBookNow} size="lg">
              Book Now
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default RoomTypeCard;
