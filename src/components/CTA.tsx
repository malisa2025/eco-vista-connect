import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-hero opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-elegant border-border/50">
            <CardContent className="p-12 md:p-16 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-sm font-medium text-primary">Ready to Get Started?</span>
              </div>
              
              <h2 className="font-display mb-6">
                Join Thousands of Businesses on AshantiConnect
              </h2>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Get your business online in minutes. Start with a free listing and upgrade as you grow.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="group shadow-glow text-lg px-8 py-6">
                  Create Business Profile
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  View Pricing Plans
                </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Setup in 5 minutes</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>No credit card required</span>
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
