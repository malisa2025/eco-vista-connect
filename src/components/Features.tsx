import { Building2, Megaphone, Star, Calendar, Briefcase, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Building2,
    title: "Enterprise Directory",
    description: "Rich business profiles with complete information, galleries, services, and real-time updates.",
    color: "text-primary",
  },
  {
    icon: Megaphone,
    title: "Advertising Engine",
    description: "Self-service ad campaigns with banner ads, featured listings, and performance tracking.",
    color: "text-secondary",
  },
  {
    icon: Star,
    title: "Reviews & Reputation",
    description: "Build trust with verified reviews, ratings, sentiment analysis, and public responses.",
    color: "text-accent",
  },
  {
    icon: Calendar,
    title: "Events & Promotions",
    description: "Share events, special offers, and engage your community with built-in RSVP tools.",
    color: "text-primary",
  },
  {
    icon: Briefcase,
    title: "Job Board",
    description: "Connect businesses with local talent through dedicated career pages and applicant tracking.",
    color: "text-secondary",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track performance, understand your audience, and benchmark against competitors.",
    color: "text-accent",
  },
];

const Features = () => {
  return (
    <section className="py-24 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="font-display mb-4">Platform Features</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to showcase your business, reach customers, and grow your brand.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-elegant transition-smooth border-border/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-bounce ${feature.color}`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
