import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
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

  // Intersection Observer for viewport detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 } // Lower threshold to trigger earlier
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Play first video immediately when component is ready
  useEffect(() => {
    if (videoAds.length > 0 && videoRefs.current[0]) {
      const firstVideo = videoRefs.current[0];
      if (firstVideo) {
        firstVideo.muted = isMuted;
        firstVideo.currentTime = 0;
        firstVideo.play().catch((error) => {
          console.log("Initial autoplay blocked, waiting for user interaction");
        });
      }
    }
  }, [videoAds.length, isMuted]);

  // Embla carousel event listeners
  useEffect(() => {
    if (!emblaApi) return;

    const onScroll = () => {
      // Pause all videos when carousel starts scrolling
      videoRefs.current.forEach(video => {
        if (video && !video.paused) {
          video.pause();
        }
      });
    };

    const onSettle = () => {
      // Carousel has settled, play first video of new slide immediately
      const currentSlide = emblaApi.selectedScrollSnap();
      const firstVideoOfSlide = currentSlide * 3;
      setCurrentPlayingIndex(firstVideoOfSlide);
    };

    emblaApi.on('scroll', onScroll);
    emblaApi.on('settle', onSettle);

    return () => {
      emblaApi.off('scroll', onScroll);
      emblaApi.off('settle', onSettle);
    };
  }, [emblaApi]);

  // Auto-play logic
  useEffect(() => {
    if (!isInView || videoAds.length === 0) return;

    const currentSlideStartIndex = Math.floor(currentPlayingIndex / 3) * 3;
    const indexInSlide = currentPlayingIndex % 3;
    const video = videoRefs.current[currentPlayingIndex];

    if (!video) return;

    // Pause all other videos first
    videoRefs.current.forEach((v, idx) => {
      if (v && idx !== currentPlayingIndex && !v.paused) {
        v.pause();
      }
    });

    const playVideo = async () => {
      try {
        video.muted = isMuted;
        video.currentTime = 0;
        await video.play();
        console.log(`Playing video ${currentPlayingIndex}`);
      } catch (error) {
        console.error(`Video ${currentPlayingIndex} play failed:`, error);
        // If autoplay fails, try again after a brief moment
        setTimeout(async () => {
          try {
            await video.play();
          } catch (retryError) {
            console.log("Retry failed - user interaction may be required");
          }
        }, 500);
      }
    };

    playVideo();

    const handleTimeUpdate = () => {
      if (video.currentTime >= PREVIEW_DURATION) {
        video.pause();
        
        // Move to next video in sequence
        if (indexInSlide < 2 && currentPlayingIndex < videoAds.length - 1) {
          // Play next video in current slide
          setCurrentPlayingIndex(currentPlayingIndex + 1);
        } else if (currentPlayingIndex < videoAds.length - 1) {
          // All 3 videos played, move to next slide
          emblaApi?.scrollNext();
          // Don't set index here - let onSettle handle it
        } else {
          // Loop back to beginning
          emblaApi?.scrollTo(0);
          // Don't set index here - let onSettle handle it
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.pause();
    };
  }, [currentPlayingIndex, isInView, videoAds.length, emblaApi, isMuted]);

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
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = newMutedState;
      }
    });
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
                          <video
                            ref={(el) => (videoRefs.current[globalIndex] = el)}
                            src={ad.video_url}
                            poster={ad.video_thumbnail_url || undefined}
                            muted={true}
                            playsInline
                            preload={globalIndex === currentPlayingIndex ? "auto" : "metadata"}
                            className="w-full h-full object-cover"
                            onError={() => {
                              console.log('Video failed to load, skipping to next');
                              if (globalIndex < videoAds.length - 1) {
                                setCurrentPlayingIndex(globalIndex + 1);
                              }
                            }}
                          />
                          
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
                                  className="h-full bg-primary transition-all duration-1000"
                                  style={{
                                    width: `${(videoRefs.current[globalIndex]?.currentTime || 0) / PREVIEW_DURATION * 100}%`,
                                  }}
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
