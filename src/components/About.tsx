import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, MapPin, Building2, Users } from "lucide-react";

const stats = [
  { icon: Building2, value: "10,000+", label: "Businesses Listed" },
  { icon: Users, value: "500,000+", label: "Monthly Users" },
  { icon: MapPin, value: "16", label: "Regions Covered" },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To digitize and connect every business in Ghana, making it easy for citizens to discover, engage, and transact with trusted local enterprises.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To become West Africa's leading business discovery platform, driving economic growth through digital transformation and accessibility.",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "Trust, transparency, and community. We believe in empowering businesses with the tools they need to succeed in the digital economy.",
  },
];

const About = () => {
  return (
    <section id="about" className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16 animate-fade-in">
          <h2 className="font-display mb-4 text-2xl sm:text-3xl md:text-4xl">About GHKonect</h2>
          <p className="text-base md:text-xl text-muted-foreground">
            Connecting businesses with communities across Ghana since 2024.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
              <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {values.map((value, index) => (
            <Card
              key={index}
              className="group hover:shadow-elegant transition-smooth border-border/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-muted flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-bounce">
                  <value.icon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{value.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company description */}
        <div className="mt-8 md:mt-16 max-w-3xl mx-auto text-center">
          <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
            GHKonect is Ghana's premier business directory and discovery platform. 
            We bridge the gap between businesses and customers by providing a 
            comprehensive, verified database of enterprises across all 16 regions. 
            Our platform empowers businesses with digital tools for growth while 
            helping citizens make informed decisions through authentic reviews 
            and up-to-date information.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
