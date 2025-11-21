import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { businessVideos, getCategoryGradient } from "@/data/businessVideos";

const PREVIEW_DURATION = 60; // 60 seconds per video

export const BusinessVideoCarousel = () => {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(0); // Which of the 3 visible videos is playing
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout>();

  // Group videos into sets of 3
  const videoGroups = [];
  for (let i = 0; i < businessVideos.length; i += 3) {
    videoGroups.push(businessVideos.slice(i, i + 3));
  }

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
      setPlayingIndex(0); // Reset to first video when slide changes
    });
  }, [api]);

  // Auto-play logic for current visible videos
  useEffect(() => {
    if (!isAutoPlaying) return;

    const currentGroup = videoGroups[currentSlide];
    if (!currentGroup) return;

    const startIndex = currentSlide * 3;
    const currentVideoIndex = startIndex + playingIndex;
    const videoElement = videoRefs.current[currentVideoIndex];

    if (videoElement) {
      // Play current video
      videoElement.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });

      const handleTimeUpdate = () => {
        if (videoElement.currentTime >= PREVIEW_DURATION) {
          videoElement.pause();
          videoElement.currentTime = 0;

          // Move to next video in the set
          if (playingIndex < currentGroup.length - 1) {
            setPlayingIndex(playingIndex + 1);
          } else {
            // All 3 videos finished, move to next slide
            if (currentSlide < videoGroups.length - 1) {
              api?.scrollNext();
            } else {
              // Loop back to start
              api?.scrollTo(0);
            }
          }
        }
      };

      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        videoElement.pause();
      };
    }
  }, [currentSlide, playingIndex, isAutoPlaying, api, videoGroups]);

  // Pause auto-play on manual interaction, resume after 5 seconds
  const handleManualNavigation = () => {
    setIsAutoPlaying(false);
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    autoPlayTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/business-news?video=${videoId}`);
  };

  return (
    <div className="relative">
      {/* Sponsored Badge */}
      <div className="absolute top-4 right-4 z-20">
        <Badge className="bg-cyan-500 text-white px-3 py-1 text-xs font-bold">
          SPONSORED
        </Badge>
      </div>

      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {videoGroups.map((group, groupIndex) => (
            <CarouselItem key={groupIndex}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.map((video, indexInGroup) => {
                  const absoluteIndex = groupIndex * 3 + indexInGroup;
                  const isCurrentlyPlaying = 
                    groupIndex === currentSlide && 
                    indexInGroup === playingIndex && 
                    isAutoPlaying;

                  return (
                    <Card
                      key={video.id}
                      className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                      onClick={() => handleVideoClick(video.id)}
                    >
                      {/* Video Player */}
                      <div className="relative aspect-video bg-black">
                        <video
                          ref={(el) => (videoRefs.current[absoluteIndex] = el)}
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          loop={false}
                        />

                        {/* Play Overlay (when not playing) */}
                        {!isCurrentlyPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                              <Play className="w-8 h-8 text-primary-foreground ml-1" />
                            </div>
                          </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className={getCategoryGradient(video.category)}>
                            {video.category}
                          </Badge>
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/70 rounded text-xs text-white">
                          <Clock className="w-3 h-3" />
                          <span>1:00</span>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold line-clamp-2 leading-tight text-sm">
                          {video.title}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {video.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {video.views.toLocaleString()} views
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVideoClick(video.id);
                            }}
                          >
                            View More
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="hidden md:block">
          <CarouselPrevious
            className="left-4"
            onClick={handleManualNavigation}
          />
          <CarouselNext
            className="right-4"
            onClick={handleManualNavigation}
          />
        </div>
      </Carousel>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {videoGroups.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              api?.scrollTo(index);
              handleManualNavigation();
            }}
            className={`h-1.5 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-1.5 bg-muted-foreground/30"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
