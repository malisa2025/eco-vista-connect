import { useEffect, useRef } from "react";
import { X, Eye } from "lucide-react";
import { BusinessVideo, getCategoryColor } from "@/data/businessVideos";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoModalProps {
  video: BusinessVideo | null;
  relatedVideos: BusinessVideo[];
  isOpen: boolean;
  onClose: () => void;
  onVideoSelect: (video: BusinessVideo) => void;
}

export const VideoModal = ({ video, relatedVideos, isOpen, onClose, onVideoSelect }: VideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
    }
  }, [isOpen, video]);

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Main Video Player */}
          <div className="flex-1 bg-black flex flex-col">
            <div className="flex items-center justify-between p-4 bg-black/90">
              {video.isLive && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-white">LIVE</span>
                </div>
              )}
              <div className="flex-1" />
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={video.videoUrl}
                controls
                autoPlay
              />
            </div>

            {/* Video Info */}
            <div className="p-6 bg-background border-t">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary" className={`${getCategoryColor(video.category)} border-current`}>
                  {video.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {video.views.toLocaleString()} views
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(video.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold mb-3">{video.title}</h2>
              <p className="text-muted-foreground">{video.description}</p>
            </div>
          </div>

          {/* Related Videos Sidebar */}
          <div className="w-full lg:w-80 border-l bg-muted/30">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Related Videos</h3>
            </div>
            <ScrollArea className="h-[calc(90vh-60px)]">
              <div className="p-4 space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <button
                    key={relatedVideo.id}
                    onClick={() => onVideoSelect(relatedVideo)}
                    className="w-full text-left group hover:bg-muted/50 rounded-lg p-2 transition-colors"
                  >
                    <div className="relative aspect-video mb-2 overflow-hidden rounded">
                      <img
                        src={relatedVideo.thumbnailUrl}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                        {relatedVideo.duration}
                      </div>
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {relatedVideo.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{relatedVideo.views.toLocaleString()} views</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
