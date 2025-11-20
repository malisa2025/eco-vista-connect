import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const CompactNewsPlayer = () => {
  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-background/95 backdrop-blur shadow-glow">
      {/* Live Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-xs font-bold text-white">LIVE</span>
      </div>

      {/* Bloomberg Live Stream */}
      <div className="relative aspect-video bg-black">
        <iframe
          src="https://www.bloomberg.com/media-manifest/embed/video?autoplay=true&muted=false"
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title="Bloomberg Live TV"
        />
      </div>

      {/* News Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
            Markets
          </span>
          <span className="text-xs text-muted-foreground">
            Bloomberg TV Live
          </span>
        </div>
        
        <h3 className="text-sm font-semibold line-clamp-2 leading-tight">
          Bloomberg Television - Live Global Business News
        </h3>

        <Link to="/business-news">
          <Button variant="outline" size="sm" className="w-full">
            Watch Full Coverage
          </Button>
        </Link>
      </div>
    </Card>
  );
};
