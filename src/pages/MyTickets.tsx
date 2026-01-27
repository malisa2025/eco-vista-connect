import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Ticket, QrCode, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useMyTickets } from '@/hooks/useEventTickets';
import { useAuth } from '@/contexts/AuthContext';

const MyTickets = () => {
  const { user } = useAuth();
  const { data: tickets, isLoading } = useMyTickets();

  const now = new Date();
  const upcomingTickets = tickets?.filter(
    t => t.event && new Date(t.event.start_date) >= now
  ) || [];
  const pastTickets = tickets?.filter(
    t => t.event && new Date(t.event.start_date) < now
  ) || [];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Login Required</h1>
            <p className="text-muted-foreground mb-4">
              Please login to view your tickets
            </p>
            <Button asChild>
              <Link to="/auth">Login</Link>
            </Button>
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
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">My Tickets</h1>
              <p className="text-muted-foreground">
                View and manage your event tickets
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : tickets?.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-1">No tickets yet</h3>
                <p className="text-muted-foreground mb-4">
                  Browse upcoming events and get your tickets
                </p>
                <Button asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingTickets.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastTickets.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingTickets.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No upcoming events
                    </CardContent>
                  </Card>
                ) : (
                  upcomingTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastTickets.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No past events
                    </CardContent>
                  </Card>
                ) : (
                  pastTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} isPast />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface TicketCardProps {
  ticket: {
    id: string;
    ticket_number: string;
    attendee_name: string | null;
    checked_in: boolean;
    event?: {
      id: string;
      title: string;
      start_date: string;
      location: string | null;
      image_url: string | null;
      business?: {
        name: string;
      };
    };
  };
  isPast?: boolean;
}

const TicketCard = ({ ticket, isPast }: TicketCardProps) => {
  if (!ticket.event) return null;

  return (
    <Card className={isPast ? 'opacity-75' : ''}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {ticket.event.image_url ? (
            <img
              src={ticket.event.image_url}
              alt={ticket.event.title}
              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold truncate">{ticket.event.title}</h3>
                {ticket.event.business && (
                  <p className="text-sm text-muted-foreground">
                    by {ticket.event.business.name}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                {ticket.checked_in ? (
                  <Badge className="bg-green-100 text-green-700">Checked In</Badge>
                ) : isPast ? (
                  <Badge variant="secondary">Expired</Badge>
                ) : (
                  <Badge variant="outline">Valid</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(ticket.event.start_date), 'MMM d, yyyy • h:mm a')}
              </span>
              {ticket.event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {ticket.event.location}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {ticket.ticket_number}
                </code>
                {ticket.attendee_name && (
                  <span className="text-sm text-muted-foreground">
                    • {ticket.attendee_name}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/events?event=${ticket.event.id}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Event
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyTickets;
