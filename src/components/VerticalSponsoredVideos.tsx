import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Volume2, VolumeX } from "lucide-react";

interface VideoAd {
  id: string;
  title: string;
  video_url: string;
  video_thumbnail_url: string | null;
  link_url: string | null;
  description: string | null;
}

interface VerticalSponsoredVideosProps {
  limit?: number;
}

const VerticalSponsoredVideos = ({ limit = 5 }: VerticalSponsoredVideosProps) => {
  const [videoAds, setVideoAds] = useState<VideoAd[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchVideoAds();
  }, []);

  const fetchVideoAds = async () => {
    const { data, error } = await supabase
      .from("advertisements")
      .select("id, title, video_url, video_thumbnail_url, link_url, description")
      .eq("status", "active")
      .not("video_url", "is", null)
      .lte("start_date", new Date().toISOString())
      .gte("end_date", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching video ads:", error);
      return;
    }

    if (data) {
      setVideoAds(data);
      // Mute all videos by default
      setMutedVideos(new Set(data.map(ad => ad.id)));
    }
  };

  useEffect(() => {
    // Set up Intersection Observer for auto-play
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute("data-video-id");
          if (!videoId) return;

          const video = videoRefs.current.get(videoId);
          if (!video) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Video is 50% visible - play it
            video.play().catch(console.error);
            setPlayingVideoId(videoId);
          } else {
            // Video left viewport - pause it
            video.pause();
            if (playingVideoId === videoId) {
              setPlayingVideoId(null);
            }
          }
        });
      },
      { threshold: [0.5] }
    );

    // Observe all video elements
    videoRefs.current.forEach((video) => {
      observerRef.current?.observe(video);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [videoAds, playingVideoId]);

  const handleVideoClick = async (ad: VideoAd) => {
    // Record click
    await supabase.from("ad_clicks").insert({
      advertisement_id: ad.id,
    });

    // Open link in new tab if available
    if (ad.link_url) {
      window.open(ad.link_url, "_blank");
    }
  };

  const toggleMute = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    const video = videoRefs.current.get(videoId);
    if (!video) return;

    const newMutedVideos = new Set(mutedVideos);
    if (mutedVideos.has(videoId)) {
      newMutedVideos.delete(videoId);
      video.muted = false;
    } else {
      newMutedVideos.add(videoId);
      video.muted = true;
    }
    setMutedVideos(newMutedVideos);
  };

  const recordImpression = async (adId: string) => {
    // Fetch current impressions count and increment
    const { data } = await supabase
      .from("advertisements")
      .select("impressions")
      .eq("id", adId)
      .single();
    
    if (data) {
      await supabase
        .from("advertisements")
        .update({ impressions: (data.impressions || 0) + 1 })
        .eq("id", adId);
    }
  };

  if (videoAds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {videoAds.map((ad) => (
        <div
          key={ad.id}
          className="relative group rounded-lg overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => handleVideoClick(ad)}
        >
          {/* Sponsored Badge */}
          <div className="absolute top-2 right-2 z-10 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 rounded text-xs font-medium">
            Sponsored
          </div>

          {/* Video */}
          <div className="relative aspect-video bg-muted">
            <video
              ref={(el) => {
                if (el) {
                  videoRefs.current.set(ad.id, el);
                }
              }}
              data-video-id={ad.id}
              src={ad.video_url}
              poster={ad.video_thumbnail_url || undefined}
              className="w-full h-full object-cover"
              loop
              playsInline
              muted={mutedVideos.has(ad.id)}
              onLoadedMetadata={() => recordImpression(ad.id)}
            />

            {/* Mute/Unmute Button */}
            <button
              onClick={(e) => toggleMute(e, ad.id)}
              className="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              aria-label={mutedVideos.has(ad.id) ? "Unmute" : "Mute"}
            >
              {mutedVideos.has(ad.id) ? (
                <VolumeX className="h-4 w-4 text-foreground" />
              ) : (
                <Volume2 className="h-4 w-4 text-foreground" />
              )}
            </button>

            {/* Play indicator when not playing */}
            {playingVideoId !== ad.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-0 h-0 border-l-8 border-l-foreground border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Title and Description Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">
              {ad.title}
            </h3>
            {ad.description && (
              <p className="text-xs text-white/80 line-clamp-2">
                {ad.description}
              </p>
            )}
            {ad.link_url && (
              <div className="flex items-center gap-1 mt-1 text-xs text-white/90">
                <ExternalLink className="h-3 w-3" />
                <span>Learn more</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerticalSponsoredVideos;
