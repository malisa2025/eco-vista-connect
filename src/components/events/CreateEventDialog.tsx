import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Loader2, ImageIcon } from 'lucide-react';
import { useEventMutations, BusinessEvent } from '@/hooks/useBusinessEvents';
import { ImageUploader } from '@/components/business/ImageUploader';

interface CreateEventDialogProps {
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: BusinessEvent | null;
}

const CreateEventDialog = ({ businessId, open, onOpenChange, event }: CreateEventDialogProps) => {
  const { createEvent, updateEvent } = useEventMutations();
  const isEditing = !!event;

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    image_url: event?.image_url || '',
    location: event?.location || '',
    start_date: event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
    end_date: event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
    price: event?.price?.toString() || '0',
    capacity: event?.capacity?.toString() || '',
    status: event?.status || 'draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description || null,
      image_url: formData.image_url || null,
      location: formData.location || null,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      price: parseFloat(formData.price) || 0,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      status: formData.status as 'draft' | 'published',
    };

    if (isEditing && event) {
      await updateEvent.mutateAsync({ id: event.id, ...payload });
    } else {
      await createEvent.mutateAsync({ business_id: businessId, ...payload });
    }

    onOpenChange(false);
  };

  const isSubmitting = createEvent.isPending || updateEvent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEditing ? 'Edit Event' : 'Create Event'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your event details' : 'Add a new event for your business'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-6">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-4 pb-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Grand Opening Celebration"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell people what this event is about..."
                rows={4}
              />
            </div>

            {/* Event Image */}
            <div>
              <Label>Event Image</Label>
              <ImageUploader
                label=""
                currentImageUrl={formData.image_url}
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                aspectRatio="16:9"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date & Time *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Main Hall, 123 Oxford Street, Accra"
              />
            </div>

            {/* Price & Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (GH₵)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0 for free"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Max Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            {/* Publish Status */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="status" className="text-base">Publish Event</Label>
                <p className="text-sm text-muted-foreground">
                  Make this event visible to the public
                </p>
              </div>
              <Switch
                id="status"
                checked={formData.status === 'published'}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 'published' : 'draft' })
                }
              />
            </div>
          </form>
        </ScrollArea>

        <div className="flex-shrink-0 border-t bg-background px-6 py-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="event-form"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
