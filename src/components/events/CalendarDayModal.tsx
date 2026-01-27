import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  image_url: string | null;
  price: number | null;
  capacity: number | null;
  attendees_count: number | null;
  business?: {
    name: string;
    logo_url: string | null;
  };
}

interface CalendarDayModalProps {
  date: Date;
  events: Event[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventClick?: (eventId: string) => void;
}

const CalendarDayModal = ({ date, events, open, onOpenChange, onEventClick }: CalendarDayModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No events on this day
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  onEventClick?.(event.id);
                  onOpenChange(false);
                }}
              >
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
                    {event.business && (
                      <p className="text-xs text-muted-foreground">
                        by {event.business.name}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.start_date), 'h:mm a')}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={event.price ? 'default' : 'secondary'} className="text-xs">
                        {event.price ? `GH₵${event.price}` : 'Free'}
                      </Badge>
                      {event.capacity && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.attendees_count || 0}/{event.capacity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarDayModal;
