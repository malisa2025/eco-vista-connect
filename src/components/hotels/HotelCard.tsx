import { Link } from "react-router-dom";
import { Star, MapPin, Wifi, UtensilsCrossed, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HotelCardProps {
  hotel: {
    id: string;
    business: {
      name: string;
      image_url: string;
      region: string;
      rating: number;
      review_count: number;
    };
    star_rating: number;
    wifi_available: boolean;
    restaurant_on_site: boolean;
    pool_available: boolean;
    room_types: Array<{
      base_price_per_night: number;
    }>;
  };
}

const HotelCard = ({ hotel }: HotelCardProps) => {
  const minPrice = Math.min(...hotel.room_types.map((r) => r.base_price_per_night));

  return (
    <Link to={`/hotels/${hotel.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="relative h-48">
          <img
            src={hotel.business.image_url || "/placeholder.svg"}
            alt={hotel.business.name}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-3 right-3 bg-background/90 text-foreground">
            {hotel.star_rating} <Star className="w-3 h-3 ml-1 fill-primary text-primary" />
          </Badge>
        </div>

        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold line-clamp-1">{hotel.business.name}</h3>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>{hotel.business.region}</span>
          </div>

          {/* Amenities */}
          <div className="flex gap-2 mb-3">
            {hotel.wifi_available && (
              <Badge variant="secondary" className="text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                WiFi
              </Badge>
            )}
            {hotel.restaurant_on_site && (
              <Badge variant="secondary" className="text-xs">
                <UtensilsCrossed className="w-3 h-3 mr-1" />
                Restaurant
              </Badge>
            )}
            {hotel.pool_available && (
              <Badge variant="secondary" className="text-xs">
                <Waves className="w-3 h-3 mr-1" />
                Pool
              </Badge>
            )}
          </div>

          {/* Rating */}
          {hotel.business.rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-semibold">{hotel.business.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({hotel.business.review_count} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex justify-between items-center pt-3 border-t">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-xl font-bold">
                GH₵{minPrice.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/night</span>
              </p>
            </div>
            <Button>View Details</Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default HotelCard;
