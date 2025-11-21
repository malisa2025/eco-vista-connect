import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { CompactNewsPlayer } from "@/components/CompactNewsPlayer";

const Hero = () => {
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

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="group shadow-glow hover:shadow-xl transition-smooth text-lg px-8 py-6">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
              <Search className="mr-2 h-5 w-5" />
              Explore Businesses
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

        {/* Right Column - News Player */}
        <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <CompactNewsPlayer />
        </div>
      </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
