import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Calendar, MapPin, QrCode, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface TicketData {
  id: string;
  ticket_number: string;
  attendee_name: string;
  attendee_email: string;
  qr_code: string;
}

interface TicketConfirmationProps {
  tickets: TicketData[];
  event: {
    title: string;
    start_date: string;
    location: string | null;
    business_name?: string;
  };
  onClose: () => void;
}

const TicketConfirmation = ({ tickets, event, onClose }: TicketConfirmationProps) => {
  const addToCalendar = () => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', event.title);
    googleCalendarUrl.searchParams.set('dates', 
      `${format(startDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`
    );
    if (event.location) {
      googleCalendarUrl.searchParams.set('location', event.location);
    }
    
    window.open(googleCalendarUrl.toString(), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-primary">Tickets Confirmed!</h2>
        <p className="text-muted-foreground mt-1">
          Your tickets have been sent to your email
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-3">{event.title}</h3>
          {event.business_name && (
            <p className="text-sm text-muted-foreground mb-2">by {event.business_name}</p>
          )}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.start_date), 'EEEE, MMMM d, yyyy • h:mm a')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          Your Tickets ({tickets.length})
        </h4>
        
        {tickets.map((ticket, index) => (
          <Card key={ticket.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {ticket.ticket_number}
                    </Badge>
                    {tickets.length > 1 && (
                      <span className="text-xs text-muted-foreground">
                        Ticket {index + 1}
                      </span>
                    )}
                  </div>
                  <p className="font-medium">{ticket.attendee_name}</p>
                  <p className="text-sm text-muted-foreground">{ticket.attendee_email}</p>
                </div>
                
                <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={addToCalendar} className="flex-1">
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
        <Button onClick={onClose} className="flex-1">
          Done
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Show your ticket QR code at the event entrance for check-in
      </p>
    </div>
  );
};

export default TicketConfirmation;
