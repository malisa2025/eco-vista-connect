import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Building2, MapPin } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { CompactNewsPlayer } from "@/components/CompactNewsPlayer";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinesses } from "@/hooks/useBusinesses";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch businesses for autocomplete
  const { data: businesses } = useBusinesses({
    search: debouncedQuery,
    limit: 5
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      navigate(`/businesses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleBusinessClick = (businessId: string) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(`/businesses/${businessId}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  return (
    <section className="relative min-h-[65vh] flex items-start pt-8 overflow-hidden">
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
      <div className="container relative z-10 mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8 items-start">
          {/* Left Column - Content */}
          <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-block mb-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-sm font-medium text-primary">Enterprise Business Listing Platform</span>
          </div>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div ref={searchRef} className="relative max-w-2xl">
              <div className="flex gap-2 bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by business name or phone number..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    className="pl-10 h-12 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8">
                  Search
                </Button>
              </div>

              {/* Autocomplete Results */}
              {showResults && debouncedQuery && businesses && businesses.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => handleBusinessClick(business.id)}
                      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left"
                    >
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{business.name}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{business.region}</span>
                          {business.category && (
                            <>
                              <span>•</span>
                              <span className="truncate">{business.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {/* View all results button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowResults(false);
                      navigate(`/businesses?search=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-center gap-2 border-t border-border hover:bg-accent transition-colors text-sm font-medium text-primary"
                  >
                    <span>View all results for "{searchQuery}"</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </form>

          <h1 className="font-display mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            The Digital Front Door for Every Business
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed">
            Connecting businesses with customers across all the regions in Ghana through our powerful directory, advertising, and community platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button size="lg" className="group shadow-glow hover:shadow-xl transition-smooth text-lg px-8 py-6" onClick={() => navigate('/auth')}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2" onClick={() => navigate('/businesses')}>
              <Search className="mr-2 h-5 w-5" />
              Explore Businesses
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-6 border-t border-border/50">
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

        {/* Right Column - News Player */}
        <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <CompactNewsPlayer />
        </div>
      </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
