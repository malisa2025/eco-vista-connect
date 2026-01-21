import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, Users, Clock, Building2, Phone, Mail, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEvent, useEventMutations } from '@/hooks/useBusinessEvents';
import { useAuth } from '@/contexts/AuthContext';

interface EventDetailModalProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventDetailModal = ({ eventId, open, onOpenChange }: EventDetailModalProps) => {
  const { user, profile } = useAuth();
  const { data: event, isLoading } = useEvent(eventId || undefined);
  const { registerForEvent } = useEventMutations();

  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Pre-fill form with user data when available
  const handleShowRegistration = () => {
    setFormData({
      name: profile?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
    });
    setShowRegistration(true);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    await registerForEvent.mutateAsync({
      event_id: eventId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
    });

    setShowRegistration(false);
    onOpenChange(false);
  };

  if (!eventId) return null;

  const isFree = event?.price === 0;
  const isSoldOut = event?.capacity && event?.attendees_count >= event?.capacity;
  const spotsLeft = event?.capacity ? event.capacity - event.attendees_count : null;
  const capacityPercentage = event?.capacity
    ? (event.attendees_count / event.capacity) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle>Event Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : event ? (
            <div className="px-6 pb-6">
              {/* Event Image */}
              {event.image_url && (
                <div className="relative -mx-6 mb-6">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant={isFree ? 'secondary' : 'default'}>
                      {isFree ? 'Free' : `GH₵${event.price}`}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Event Title */}
              <h2 className="text-xl font-bold mb-4">{event.title}</h2>

              {/* Event Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(event.start_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start_date), 'h:mm a')}
                      {event.end_date && ` - ${format(new Date(event.end_date), 'h:mm a')}`}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p>{event.location}</p>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{event.attendees_count} registered</span>
                        <span>{spotsLeft} spots left</span>
                      </div>
                      <Progress value={capacityPercentage} className="h-2" />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">About This Event</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Organizer */}
              {event.businesses && (
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-3">Organized by</h3>
                  <div className="flex items-center gap-3">
                    {event.businesses.logo_url ? (
                      <img
                        src={event.businesses.logo_url}
                        alt={event.businesses.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{event.businesses.name}</p>
                      {event.businesses.region && (
                        <p className="text-sm text-muted-foreground">{event.businesses.region}</p>
                      )}
                    </div>
                  </div>
                  {(event.businesses.phone || event.businesses.email) && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-background/50">
                      {event.businesses.phone && (
                        <a
                          href={`tel:${event.businesses.phone}`}
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {event.businesses.phone}
                        </a>
                      )}
                      {event.businesses.email && (
                        <a
                          href={`mailto:${event.businesses.email}`}
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          {event.businesses.email}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Registration Form */}
              {showRegistration ? (
                <form onSubmit={handleRegister} className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold">Register for this Event</h3>
                  <div>
                    <Label htmlFor="reg-name">Full Name *</Label>
                    <Input
                      id="reg-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-email">Email *</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-phone">Phone (optional)</Label>
                    <Input
                      id="reg-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowRegistration(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={registerForEvent.isPending}
                    >
                      {registerForEvent.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Confirm Registration'
                      )}
                    </Button>
                  </div>
                </form>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Event not found</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer Action */}
        {event && !showRegistration && (
          <div className="flex-shrink-0 border-t bg-background px-6 py-4">
            <Button
              className="w-full"
              size="lg"
              disabled={isSoldOut}
              onClick={handleShowRegistration}
            >
              {isSoldOut ? 'Event is Full' : isFree ? 'Register for Free' : `Register - GH₵${event.price}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;
