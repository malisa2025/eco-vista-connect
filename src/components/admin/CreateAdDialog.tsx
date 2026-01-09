import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdSpots, useAdMutations } from '@/hooks/useAdvertisements';
import { useAllBusinessesForAdmin } from '@/hooks/useBusinesses';
import { VideoUploader } from '@/components/business/VideoUploader';
import { ImageUploader } from '@/components/business/ImageUploader';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateAdDialog = ({ open, onOpenChange, onSuccess }: CreateAdDialogProps) => {
  const { data: businesses, isLoading: businessesLoading } = useAllBusinessesForAdmin();
  const { data: adSpots, isLoading: spotsLoading } = useAdSpots();
  const { createAdminAd } = useAdMutations();

  const [formData, setFormData] = useState({
    business_id: '',
    ad_spot_id: '',
    title: '',
    description: '',
    video_url: '',
    video_thumbnail_url: '',
    video_duration: 0,
    image_url: '',
    link_url: '',
    start_date: '',
    end_date: '',
    status: 'draft' as 'draft' | 'active' | 'paused',
    mark_as_paid: false,
    payment_reference: '',
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [totalCost, setTotalCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total cost when dates or ad spot changes
  useEffect(() => {
    if (startDate && endDate && formData.ad_spot_id) {
      const selectedSpot = adSpots?.find(spot => spot.id === formData.ad_spot_id);
      if (selectedSpot) {
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        setTotalCost(days * Number(selectedSpot.price_per_day));
      }
    }
  }, [startDate, endDate, formData.ad_spot_id, adSpots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.business_id) {
      toast.error('Please select a business');
      return;
    }
    if (!formData.ad_spot_id) {
      toast.error('Please select an ad spot');
      return;
    }
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.image_url && !formData.video_url) {
      toast.error('Please upload at least an image or video');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSubmitting(true);

    try {
      await createAdminAd.mutateAsync({
        business_id: formData.business_id,
        ad_spot_id: formData.ad_spot_id,
        title: formData.title,
        description: formData.description || undefined,
        video_url: formData.video_url || undefined,
        video_thumbnail_url: formData.video_thumbnail_url || undefined,
        video_duration: formData.video_duration || undefined,
        image_url: formData.image_url,
        link_url: formData.link_url || undefined,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        status: formData.status,
        total_cost: totalCost,
        payment_status: formData.mark_as_paid ? 'success' : 'pending',
        payment_reference: formData.payment_reference || undefined,
      });

      toast.success('Advertisement created successfully');
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to create ad:', error);
      toast.error('Failed to create advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      business_id: '',
      ad_spot_id: '',
      title: '',
      description: '',
      video_url: '',
      video_thumbnail_url: '',
      video_duration: 0,
      image_url: '',
      link_url: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      mark_as_paid: false,
      payment_reference: '',
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setTotalCost(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Advertisement</DialogTitle>
          <DialogDescription>Create a new advertisement campaign for a business</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Selection */}
          <div className="space-y-2">
            <Label htmlFor="business">Business *</Label>
            <Select
              value={formData.business_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, business_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a business" />
              </SelectTrigger>
              <SelectContent>
                {businessesLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">Loading businesses...</div>
                ) : businesses?.map((business) => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ad Spot Selection */}
          <div className="space-y-2">
            <Label>Ad Spot *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {spotsLoading ? (
                <div className="col-span-full text-sm text-muted-foreground">Loading ad spots...</div>
              ) : adSpots?.map((spot) => (
                <Card
                  key={spot.id}
                  className={cn(
                    "p-4 cursor-pointer hover:border-primary transition-colors",
                    formData.ad_spot_id === spot.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, ad_spot_id: spot.id }))}
                >
                  <div className="font-medium text-sm mb-1">{spot.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{spot.location}</div>
                  <div className="text-lg font-bold">${spot.price_per_day}/day</div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ad Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter ad title"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter ad description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">Link URL</Label>
              <Input
                id="link_url"
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <Label>Video Ad (Optional)</Label>
            <VideoUploader
              onUploadComplete={(url, thumbnailUrl, duration) => {
                setFormData(prev => ({
                  ...prev,
                  video_url: url,
                  video_thumbnail_url: thumbnailUrl || '',
                  video_duration: duration || 0,
                }));
              }}
              currentVideoUrl={formData.video_url}
              prompt="Upload or record a video advertisement"
            />
          </div>

          {/* Poster/Fallback Image */}
          <div className="space-y-2">
            <Label>Poster Image *</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Used as fallback for video ads or as the main image for static ads
            </p>
            <ImageUploader
              onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              currentImageUrl={formData.image_url}
              label="Upload poster image"
              aspectRatio="16:9"
            />
          </div>

          {/* Campaign Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || date <= startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Cost Display */}
          {totalCost > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Campaign Duration</p>
                  <p className="text-lg font-medium">
                    {startDate && endDate && Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Override */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mark_as_paid"
                checked={formData.mark_as_paid}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, mark_as_paid: checked as boolean }))
                }
              />
              <Label
                htmlFor="mark_as_paid"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Mark as paid (Admin override)
              </Label>
            </div>

            {formData.mark_as_paid && (
              <div className="space-y-2">
                <Label htmlFor="payment_reference">Payment Reference (Optional)</Label>
                <Input
                  id="payment_reference"
                  value={formData.payment_reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_reference: e.target.value }))}
                  placeholder="Enter payment reference"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Advertisement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAdDialog;
