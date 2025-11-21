import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { BusinessVideoCarousel } from "@/components/BusinessVideoCarousel";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/businesses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Kejetia Market in Kumasi, Ghana - vibrant marketplace showcasing Ghana's business community" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-start">
          {/* Left Column - Content */}
          <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-sm font-medium text-primary">Enterprise Business Listing Platform</span>
          </div>
          
          <h1 className="font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            The Digital Front Door for Every Business
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Connecting businesses with customers across all the regions in Ghana through our powerful directory, advertising, and community platform.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search businesses by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 h-14 text-lg bg-background/95 backdrop-blur border-2 border-border/50 focus:border-primary shadow-lg hover:shadow-xl transition-smooth"
              />
              <Button 
                type="submit"
                size="lg" 
                className="absolute right-2 top-1/2 -translate-y-1/2 shadow-glow"
              >
                Search
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/businesses')}
              variant="outline"
              className="text-lg px-8 py-6 border-2"
            >
              Explore All Businesses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
            <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">10K+</div>
              <div className="text-sm text-muted-foreground">Active Businesses</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">500K+</div>
              <div className="text-sm text-muted-foreground">Monthly Users</div>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: "0.4s" }}>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">Reviews & Ratings</div>
            </div>
          </div>
        </div>

        {/* Right Column - Video Carousel */}
        <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <BusinessVideoCarousel />
        </div>
      </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
