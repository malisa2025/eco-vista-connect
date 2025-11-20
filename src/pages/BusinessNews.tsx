import { useState } from "react";
import { Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { VideoCard } from "@/components/news/VideoCard";
import { CategorySection } from "@/components/news/CategorySection";
import { VideoModal } from "@/components/news/VideoModal";
import { businessVideos, BusinessVideo } from "@/data/businessVideos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const categories = ['All', 'Markets', 'Startups', 'Economy', 'Technology', 'Property', 'Agriculture'] as const;

const BusinessNews = () => {
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>('All');
  const [selectedVideo, setSelectedVideo] = useState<BusinessVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');

  const featuredVideos = businessVideos.filter(v => v.isFeatured);
  const filteredVideos = selectedCategory === 'All' 
    ? businessVideos 
    : businessVideos.filter(v => v.category === selectedCategory);

  const handleVideoClick = (video: BusinessVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleVideoSelect = (video: BusinessVideo) => {
    setSelectedVideo(video);
  };

  const getRelatedVideos = (currentVideo: BusinessVideo | null) => {
    if (!currentVideo) return [];
    return businessVideos
      .filter(v => v.id !== currentVideo.id && v.category === currentVideo.category)
      .slice(0, 6);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Successfully subscribed to Business News Daily!');
    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">LIVE Business News Coverage</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Business News Ghana
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Stay informed with the latest business opportunities, market insights, and economic news from across Ghana and beyond
            </p>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Featured Video */}
          {featuredVideos.length > 0 && (
            <div className="max-w-5xl mx-auto">
              <div 
                className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border-2 border-primary/20"
                onClick={() => handleVideoClick(featuredVideos[0])}
              >
                <img
                  src={featuredVideos[0].thumbnailUrl}
                  alt={featuredVideos[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/90 group-hover:bg-primary group-hover:scale-110 transition-all flex items-center justify-center shadow-xl">
                    <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge className="mb-3 bg-red-500 hover:bg-red-600">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                    LIVE NOW
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {featuredVideos[0].title}
                  </h2>
                  <p className="text-white/80 line-clamp-2">
                    {featuredVideos[0].description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVideos.slice(1).map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => handleVideoClick(video)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category Sections */}
      <div className="space-y-8 py-8">
        <CategorySection
          title="Markets & Finance"
          category="Markets"
          videos={businessVideos}
          onVideoClick={handleVideoClick}
        />
        <CategorySection
          title="Startups & Innovation"
          category="Startups"
          videos={businessVideos}
          onVideoClick={handleVideoClick}
        />
        <CategorySection
          title="Economy & Trade"
          category="Economy"
          videos={businessVideos}
          onVideoClick={handleVideoClick}
        />
        <CategorySection
          title="Technology & Digital"
          category="Technology"
          videos={businessVideos}
          onVideoClick={handleVideoClick}
        />
        <CategorySection
          title="Real Estate & Property"
          category="Property"
          videos={businessVideos}
          onVideoClick={handleVideoClick}
        />
        <CategorySection
          title="Agriculture & Manufacturing"
          category="Agriculture"
          videos={businessVideos}
          onVideoClick={handleVideoClick}
        />
      </div>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Get Daily Business News Digest</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to receive the top business stories delivered to your inbox every morning
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        relatedVideos={getRelatedVideos(selectedVideo)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVideoSelect={handleVideoSelect}
      />

      <Footer />
    </div>
  );
};

export default BusinessNews;
