import { useActiveAds, useAdMutations } from '@/hooks/useAdvertisements';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface AdSlotProps {
  location: string;
  className?: string;
}

const AdSlot = ({ location, className = '' }: AdSlotProps) => {
  const { data: ads } = useActiveAds(location);
  const { recordAdClick } = useAdMutations();

  if (!ads || ads.length === 0) return null;

  // Show first ad for the location
  const ad = ads[0];

  const handleClick = () => {
    recordAdClick.mutate(ad.id);
    if (ad.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  return (
    <Card
      className={`relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all ${className}`}
      onClick={handleClick}
    >
      <Badge className="absolute top-2 right-2 z-10" variant="secondary">
        Sponsored
      </Badge>
      
      <div className="aspect-video relative overflow-hidden">
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold flex items-center gap-2">
              {ad.title}
              <ExternalLink className="h-4 w-4" />
            </h3>
            {ad.description && (
              <p className="text-sm mt-1 opacity-90">{ad.description}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdSlot;
