import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, MoreVertical, Eye, Edit, Trash2, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useBusinessEvents, useEventMutations, BusinessEvent } from '@/hooks/useBusinessEvents';
import CreateEventDialog from './CreateEventDialog';

interface EventsListProps {
  businessId: string;
}

const EventsList = ({ businessId }: EventsListProps) => {
  const { data: events, isLoading } = useBusinessEvents(businessId);
  const { deleteEvent } = useEventMutations();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingEventId) return;
    await deleteEvent.mutateAsync({ id: deletingEventId, businessId });
    setDeletingEventId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const upcomingEvents = events?.filter(
    (e) => new Date(e.start_date) >= new Date() && e.status !== 'cancelled'
  ) || [];
  const pastEvents = events?.filter(
    (e) => new Date(e.start_date) < new Date() || e.status === 'cancelled'
  ) || [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events
          </CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading events...
            </div>
          ) : events?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No events yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first event to attract customers
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">
                    UPCOMING ({upcomingEvents.length})
                  </h3>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        onEdit={() => setEditingEvent(event)}
                        onDelete={() => setDeletingEventId(event.id)}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">
                    PAST ({pastEvents.length})
                  </h3>
                  <div className="space-y-3 opacity-75">
                    {pastEvents.map((event) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        onEdit={() => setEditingEvent(event)}
                        onDelete={() => setDeletingEventId(event.id)}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateEventDialog
        businessId={businessId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit Dialog */}
      {editingEvent && (
        <CreateEventDialog
          businessId={businessId}
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          event={editingEvent}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingEventId}
        onOpenChange={(open) => !open && setDeletingEventId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
              All registrations will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface EventRowProps {
  event: BusinessEvent;
  onEdit: () => void;
  onDelete: () => void;
  getStatusColor: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline';
}

const EventRow = ({ event, onEdit, onDelete, getStatusColor }: EventRowProps) => {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
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
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{event.title}</h4>
          <Badge variant={getStatusColor(event.status)}>{event.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(new Date(event.start_date), 'MMM d, yyyy • h:mm a')}
        </p>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {event.attendees_count} registered
          </span>
          {event.capacity && (
            <span>/ {event.capacity} capacity</span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EventsList;
