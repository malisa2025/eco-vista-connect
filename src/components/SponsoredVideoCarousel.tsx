import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// Helper to extract Cloudflare video ID
const extractCloudflareVideoId = (url: string): string | null => {
  if (url.includes('watch.cloudflarestream.com')) {
    return url.split('/').pop()?.split('?')[0] || null;
  } else if (url.includes('cloudflarestream.com')) {
    const match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
  return null;
};

interface VideoAd {
  id: string;
  title: string;
  video_url: string;
  video_thumbnail_url: string | null;
  link_url: string | null;
  description: string | null;
}

const PREVIEW_DURATION = 15; // seconds - reduced for faster transitions

export const SponsoredVideoCarousel = ({ className }: { className?: string }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [videoAds, setVideoAds] = useState<VideoAd[]>([]);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideoAds = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("advertisements")
        .select("id, title, video_url, video_thumbnail_url, link_url, description")
        .eq("status", "active")
        .not("video_url", "is", null)
        .gte("end_date", today)
        .lte("start_date", today);

      if (data && !error) {
        setVideoAds(data as VideoAd[]);
        
        // Track impressions
        data.forEach((ad) => {
          supabase.from("ad_clicks").insert({
            advertisement_id: ad.id,
            user_agent: navigator.userAgent,
          });
        });
      }
    };

    fetchVideoAds();
  }, []);

  // Track video ads loaded
  useEffect(() => {
    // Initialize iframe refs array
    iframeRefs.current = new Array(videoAds.length).fill(null);
  }, [videoAds]);

  // Intersection Observer for viewport detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Embla carousel event listeners
  useEffect(() => {
    if (!emblaApi) return;

    const onSettle = () => {
      // Carousel has settled, play first video of new slide immediately
      const currentSlide = emblaApi.selectedScrollSnap();
      const firstVideoOfSlide = currentSlide * 3;
      setCurrentPlayingIndex(firstVideoOfSlide);
    };

    emblaApi.on('settle', onSettle);

    return () => {
      emblaApi.off('settle', onSettle);
    };
  }, [emblaApi]);

  // Auto-advance slides with timer (since iframe controls are harder to track)
  useEffect(() => {
    if (!isInView || videoAds.length === 0) return;

    const timer = setInterval(() => {
      const indexInSlide = currentPlayingIndex % 3;
      const currentSlide = Math.floor(currentPlayingIndex / 3);
      const totalSlides = Math.ceil(videoAds.length / 3);
      const videosInCurrentSlide = Math.min(3, videoAds.length - currentSlide * 3);
      
      if (indexInSlide < videosInCurrentSlide - 1) {
        // Move to next video in current slide
        setCurrentPlayingIndex(currentPlayingIndex + 1);
      } else if (currentSlide < totalSlides - 1) {
        // Move to next slide
        emblaApi?.scrollNext();
      } else {
        // Loop back to beginning
        emblaApi?.scrollTo(0);
        setCurrentPlayingIndex(0);
      }
    }, PREVIEW_DURATION * 1000);

    return () => clearInterval(timer);
  }, [currentPlayingIndex, isInView, videoAds.length, emblaApi]);

  const handleVideoClick = async (ad: VideoAd, index: number) => {
    // Track click
    await supabase.from("ad_clicks").insert({
      advertisement_id: ad.id,
      user_agent: navigator.userAgent,
    });

    if (ad.link_url) {
      window.open(ad.link_url, "_blank");
    } else {
      navigate("/business-news");
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  if (videoAds.length === 0) return null;

  // Group videos into slides of 3
  const slides = [];
  for (let i = 0; i < videoAds.length; i += 3) {
    slides.push(videoAds.slice(i, i + 3));
  }

  return (
    <div ref={containerRef} className={className}>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="text-sm">
            Sponsored
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide, slideIndex) => (
              <div key={slideIndex} className="flex-[0_0_100%] min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slide.map((ad, indexInSlide) => {
                    const globalIndex = slideIndex * 3 + indexInSlide;
                    const isPlaying = globalIndex === currentPlayingIndex;

                    return (
                      <div
                        key={ad.id}
                        className="relative group cursor-pointer overflow-hidden rounded-lg bg-card border transition-all hover:shadow-lg"
                        onClick={() => handleVideoClick(ad, globalIndex)}
                      >
                        <div className="relative aspect-video">
                          {(() => {
                            const videoId = extractCloudflareVideoId(ad.video_url);
                            const shouldAutoplay = isPlaying && isInView;
                            
                            if (videoId) {
                              // Use Cloudflare Stream iframe embed
                              return (
                                <iframe
                                  ref={(el) => (iframeRefs.current[globalIndex] = el)}
                                  src={`https://iframe.cloudflarestream.com/${videoId}?autoplay=${shouldAutoplay}&loop=true&muted=${isMuted}&controls=false&poster=${ad.video_thumbnail_url || ''}`}
                                  className="w-full h-full"
                                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                                  style={{ border: 'none' }}
                                />
                              );
                            } else {
                              // Fallback for non-Cloudflare videos
                              return (
                                <video
                                  poster={ad.video_thumbnail_url || undefined}
                                  src={ad.video_url}
                                  muted={isMuted}
                                  playsInline
                                  autoPlay={shouldAutoplay}
                                  loop
                                  className="w-full h-full object-cover"
                                />
                              );
                            }
                          })()}
                          
                          {/* Video sequence indicator */}
                          <div className="absolute top-2 left-2 z-10">
                            <Badge 
                              variant={isPlaying ? "default" : "secondary"}
                              className={`text-xs font-semibold ${
                                isPlaying 
                                  ? 'animate-pulse shadow-lg' 
                                  : 'opacity-70'
                              }`}
                            >
                              {indexInSlide + 1}/{slide.length}
                            </Badge>
                          </div>

                          {!isPlaying && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-12 w-12 text-white" />
                            </div>
                          )}

                          {isPlaying && (
                            <div className="absolute top-2 right-2">
                              <div className="h-2 w-16 bg-background/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary animate-pulse"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-1 text-foreground">
                            {ad.title}
                          </h3>
                          {ad.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {ad.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  Math.floor(currentPlayingIndex / 3) === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
