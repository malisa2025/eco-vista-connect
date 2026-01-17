import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HLSVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onError?: () => void;
}

export const HLSVideoPlayer = ({
  src,
  poster,
  className = '',
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  onError,
}: HLSVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [useIframe, setUseIframe] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Check if this is a Cloudflare Stream URL (needs iframe to avoid CORS)
    // Cloudflare Stream URLs contain 'cloudflarestream.com' in various formats
    const isCloudflareStream = src.includes('cloudflarestream.com');
    
    if (isCloudflareStream) {
      setUseIframe(true);
      return;
    }

    setUseIframe(false);

    // Check if this is an HLS stream
    const isHLS = src.includes('.m3u8');

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHLS && Hls.isSupported()) {
      // Use HLS.js for browsers that don't natively support HLS
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
          // Try to recover or fall back
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else {
            onError?.();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari has native HLS support
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => {});
      }
    } else {
      // Non-HLS video (mp4, webm, etc.)
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, onError]);

  // For Cloudflare Stream URLs, use iframe embed to avoid CORS issues
  if (useIframe) {
    // Extract video ID from various Cloudflare Stream URL formats:
    // - https://watch.cloudflarestream.com/{uid}
    // - https://customer-{subdomain}.cloudflarestream.com/{uid}/manifest/video.m3u8
    // - https://customer-{subdomain}.cloudflarestream.com/{uid}/thumbnails/thumbnail.jpg
    let videoId = '';
    
    if (src.includes('watch.cloudflarestream.com')) {
      videoId = src.split('/').pop()?.split('?')[0] || '';
    } else if (src.includes('cloudflarestream.com')) {
      // Extract UID from paths like /uid/manifest/video.m3u8 or /uid/thumbnails/...
      const match = src.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)/);
      videoId = match ? match[1] : '';
    }
    
    if (!videoId) {
      console.error('Could not extract video ID from Cloudflare URL:', src);
      return null;
    }
    
    return (
      <iframe
        src={`https://iframe.cloudflarestream.com/${videoId}?${autoPlay ? 'autoplay=true&' : ''}${muted ? 'muted=true&' : ''}${loop ? 'loop=true&' : ''}controls=${controls}`}
        className={className}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        style={{ border: 'none', width: '100%', aspectRatio: '16/9' }}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      controls={controls}
      muted={muted}
      loop={loop}
      playsInline
    />
  );
};

export default HLSVideoPlayer;
