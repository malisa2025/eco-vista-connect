import { useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { businessVideos } from "@/data/businessVideos";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const CompactNewsPlayer = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const liveVideos = businessVideos.filter(v => v.isLive);
  const currentVideo = liveVideos[currentIndex] || businessVideos[0];

  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % liveVideos.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [isPlaying, liveVideos.length]);

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-background/95 backdrop-blur shadow-glow">
      {/* Live Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-xs font-bold text-white">LIVE</span>
      </div>

      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        <video
          className="w-full h-full object-cover"
          src={currentVideo.videoUrl}
          autoPlay={isPlaying}
          muted={isMuted}
          loop
        />
        
        {/* Play Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button
              size="lg"
              onClick={() => setIsPlaying(true)}
              className="rounded-full w-16 h-16"
            >
              <Play className="w-8 h-8" />
            </Button>
          </div>
        )}

        {/* Controls */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* News Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
            {currentVideo.category}
          </span>
          <span className="text-xs text-muted-foreground">
            {currentVideo.views.toLocaleString()} views
          </span>
        </div>
        
        <h3 className="text-sm font-semibold line-clamp-2 leading-tight">
          {currentVideo.title}
        </h3>

        <Link to="/business-news">
          <Button variant="outline" size="sm" className="w-full">
            Watch Full Coverage
          </Button>
        </Link>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1 pb-3">
        {liveVideos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </Card>
  );
};
