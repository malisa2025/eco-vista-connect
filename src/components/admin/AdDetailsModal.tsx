import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Calendar, MapPin, Eye, MousePointerClick, TrendingUp } from 'lucide-react';

interface AdDetailsModalProps {
  ad: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdDetailsModal = ({ ad, open, onOpenChange }: AdDetailsModalProps) => {
  if (!ad) return null;

  const ctr = ad.impressions > 0 ? ((ad.total_clicks / ad.impressions) * 100).toFixed(2) : '0.00';
  const daysRemaining = Math.ceil((new Date(ad.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{ad.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ad Image */}
          <div className="w-full">
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business</p>
              <p className="font-medium">{ad.businesses?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                {ad.status}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {ad.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{ad.description}</p>
            </div>
          )}

          {/* Ad Spot Info */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{ad.ad_spots?.name}</span>
            <Badge variant="outline">{ad.ad_spots?.location}</Badge>
          </div>

          {/* Campaign Period */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(ad.start_date).toLocaleDateString()} - {new Date(ad.end_date).toLocaleDateString()}</span>
            </div>
            {ad.status === 'active' && daysRemaining > 0 && (
              <Badge variant="outline">{daysRemaining} days remaining</Badge>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Impressions</p>
              </div>
              <p className="text-2xl font-bold">{ad.impressions || 0}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clicks</p>
              </div>
              <p className="text-2xl font-bold">{ad.total_clicks || 0}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">CTR</p>
              </div>
              <p className="text-2xl font-bold">{ctr}%</p>
            </div>
          </div>

          {/* Cost Info */}
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-xl font-bold">${ad.total_cost}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <Badge variant={ad.payment_status === 'paid' ? 'default' : 'secondary'}>
                {ad.payment_status || 'pending'}
              </Badge>
            </div>
          </div>

          {/* Link URL */}
          {ad.link_url && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Link URL</p>
              <a 
                href={ad.link_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {ad.link_url}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdDetailsModal;
