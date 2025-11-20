import { Play, Eye } from "lucide-react";
import { BusinessVideo, getCategoryColor } from "@/data/businessVideos";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VideoCardProps {
  video: BusinessVideo;
  onClick: () => void;
}

export const VideoCard = ({ video, onClick }: VideoCardProps) => {
  return (
    <Card 
      className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/90 group-hover:bg-primary group-hover:scale-110 transition-all flex items-center justify-center">
            <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
          {video.duration}
        </div>

        {/* Live Badge */}
        {video.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-red-500 rounded">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-bold text-white">LIVE</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className={`${getCategoryColor(video.category)} border-current`}>
            {video.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            {video.views.toLocaleString()}
          </div>
        </div>

        <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {video.description}
        </p>

        <div className="text-xs text-muted-foreground">
          {new Date(video.publishedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>
    </Card>
  );
};
