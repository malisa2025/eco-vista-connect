import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    location: string | null;
    start_date: string;
    end_date: string | null;
    price: number;
    capacity: number | null;
    attendees_count: number;
    status: string;
    businesses?: {
      id: string;
      name: string;
      logo_url: string | null;
      region: string | null;
    };
  };
  onViewDetails?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
  compact?: boolean;
}

const EventCard = ({ event, onViewDetails, onRegister, compact = false }: EventCardProps) => {
  const isFree = event.price === 0;
  const isSoldOut = event.capacity && event.attendees_count >= event.capacity;
  const spotsLeft = event.capacity ? event.capacity - event.attendees_count : null;

  const formatEventDate = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (start.toDateString() === end.toDateString()) {
        return `${format(start, 'MMM d, yyyy')} • ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
      }
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(start, 'MMM d, yyyy • h:mm a');
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails?.(event.id)}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{event.title}</h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {format(new Date(event.start_date), 'MMM d, h:mm a')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isFree ? 'secondary' : 'default'} className="text-xs">
                  {isFree ? 'Free' : `GH₵${event.price}`}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant={isFree ? 'secondary' : 'default'}>
            {isFree ? 'Free' : `GH₵${event.price}`}
          </Badge>
          {isSoldOut && (
            <Badge variant="destructive">Sold Out</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>

        {event.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatEventDate(event.start_date, event.end_date)}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.capacity && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>
                {isSoldOut
                  ? 'No spots left'
                  : `${spotsLeft} spots left`}
              </span>
            </div>
          )}
        </div>

        {event.businesses && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            {event.businesses.logo_url ? (
              <img
                src={event.businesses.logo_url}
                alt={event.businesses.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">
                  {event.businesses.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{event.businesses.name}</p>
              {event.businesses.region && (
                <p className="text-xs text-muted-foreground">{event.businesses.region}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails?.(event.id)}
          >
            View Details
          </Button>
          <Button
            className="flex-1"
            disabled={isSoldOut}
            onClick={() => onRegister?.(event.id)}
          >
            {isSoldOut ? 'Sold Out' : 'Register'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
