import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-12 md:py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-hero opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-elegant border-border/50">
            <CardContent className="p-6 sm:p-10 md:p-16 text-center">
              <div className="inline-block mb-4 md:mb-6 px-3 md:px-4 py-1.5 md:py-2 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-xs md:text-sm font-medium text-primary">Ready to Get Started?</span>
              </div>
              
              <h2 className="font-display mb-4 md:mb-6 text-2xl sm:text-3xl md:text-4xl">
                Join Thousands of Businesses on GHKonect
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto">
                Get your business online in minutes. Start with a free listing and upgrade as you grow.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12">
                <Button size="lg" className="group shadow-glow text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6">
                  Create Business Profile
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-smooth" />
                </Button>
                <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 border-2">
                  View Pricing Plans
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 pt-6 md:pt-8 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm md:text-base">Free to start</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm md:text-base">Setup in 5 minutes</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm md:text-base">No credit card required</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Need to import Card
import { Card, CardContent } from "@/components/ui/card";

export default CTA;
