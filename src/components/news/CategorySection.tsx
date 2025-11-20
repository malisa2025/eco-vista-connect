import { BusinessVideo, getCategoryGradient } from "@/data/businessVideos";
import { VideoCard } from "./VideoCard";

interface CategorySectionProps {
  title: string;
  category: BusinessVideo['category'];
  videos: BusinessVideo[];
  onVideoClick: (video: BusinessVideo) => void;
}

export const CategorySection = ({ title, category, videos, onVideoClick }: CategorySectionProps) => {
  const categoryVideos = videos.filter(v => v.category === category).slice(0, 6);
  
  if (categoryVideos.length === 0) return null;

  return (
    <section className={`py-12 ${getCategoryGradient(category)} rounded-3xl`}>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">Latest updates and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => onVideoClick(video)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
