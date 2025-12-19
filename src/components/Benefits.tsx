import { Card, CardContent } from "@/components/ui/card";
import { Store, Users, Building } from "lucide-react";

const benefits = [
  {
    icon: Store,
    title: "For Businesses",
    items: [
      "Beautiful branded profiles that replace static listings",
      "Targeted visibility through ads and featured placements",
      "Build reputation with customer reviews and ratings",
      "Promote events and job openings to local audiences",
      "Track performance with comprehensive analytics",
    ],
    gradient: "from-primary/10 to-primary-glow/10",
  },
  {
    icon: Users,
    title: "For Citizens",
    items: [
      "Find trusted businesses with verified information",
      "Read authentic reviews from real customers",
      "Discover local events and promotions",
      "Search jobs from businesses in your area",
      "Mobile-first experience with interactive maps",
    ],
    gradient: "from-secondary/10 to-secondary/5",
  },
  {
    icon: Building,
    title: "For Government & Partners",
    items: [
      "Single digital window into business ecosystem",
      "Data insights for policy and economic development",
      "Platform for SME support programs and campaigns",
      "Co-branding opportunities for regional identity",
      "Analytics for understanding business activity trends",
    ],
    gradient: "from-accent/10 to-accent/5",
  },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16 animate-fade-in">
          <h2 className="font-display mb-4 text-2xl sm:text-3xl md:text-4xl">Built for Everyone</h2>
          <p className="text-base md:text-xl text-muted-foreground">
            GHKonect creates value for businesses, citizens, and government partners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="group hover:shadow-elegant transition-smooth border-border/50 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`h-1.5 md:h-2 bg-gradient-to-r ${benefit.gradient}`} />
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-muted flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-bounce">
                  <benefit.icon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 md:mb-6">{benefit.title}</h3>
                <ul className="space-y-2 md:space-y-3">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0" />
                      <span className="text-sm md:text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
