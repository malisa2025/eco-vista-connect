import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Hls from 'hls.js';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
}

// Extract video ID from Cloudflare Stream URLs
const extractCloudflareVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle iframe.cloudflarestream.com or watch.cloudflarestream.com URLs
  if (url.includes('cloudflarestream.com')) {
    const match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
  
  // Handle customer-xxxxxx.cloudflarestream.com URLs
  if (url.includes('.cloudflarestream.com')) {
    const match = url.match(/\.cloudflarestream\.com\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
  
  return null;
};

const VideoPlayer = ({ videoUrl, thumbnailUrl, title }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Check if this is a Cloudflare Stream URL
  const isCloudflareStream = videoUrl?.includes('cloudflarestream.com');
  const cloudflareVideoId = extractCloudflareVideoId(videoUrl);

  useEffect(() => {
    // Skip for Cloudflare Stream - handled by iframe
    if (isCloudflareStream) return;

    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const isHLS = videoUrl.includes('.m3u8');

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else {
      video.src = videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, isCloudflareStream]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  // Render Cloudflare Stream iframe for Cloudflare URLs
  if (isCloudflareStream && cloudflareVideoId) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://iframe.cloudflarestream.com/${cloudflareVideoId}?poster=${encodeURIComponent(thumbnailUrl || '')}&controls=true&autoplay=false`}
          className="w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
          title={title || 'Video player'}
        />
      </div>
    );
  }

  return (
    <div 
      className="relative rounded-lg overflow-hidden bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={thumbnailUrl}
        muted={isMuted}
        controls={false}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Play overlay when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            size="lg"
            className="rounded-full h-16 w-16"
            onClick={togglePlay}
          >
            <Play className="h-8 w-8" />
          </Button>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            {title && (
              <span className="text-white text-sm flex-1">{title}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
