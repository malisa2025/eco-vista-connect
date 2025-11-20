import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const regions = [
  { name: "Greater Accra", businessCount: 2847, color: "from-primary/20 to-primary/5" },
  { name: "Ashanti", businessCount: 2156, color: "from-secondary/20 to-secondary/5" },
  { name: "Western", businessCount: 1234, color: "from-primary/20 to-primary/5" },
  { name: "Western North", businessCount: 892, color: "from-secondary/20 to-secondary/5" },
  { name: "Central", businessCount: 1456, color: "from-primary/20 to-primary/5" },
  { name: "Eastern", businessCount: 1678, color: "from-secondary/20 to-secondary/5" },
  { name: "Volta", businessCount: 1123, color: "from-primary/20 to-primary/5" },
  { name: "Oti", businessCount: 645, color: "from-secondary/20 to-secondary/5" },
  { name: "Northern", businessCount: 1089, color: "from-primary/20 to-primary/5" },
  { name: "Savannah", businessCount: 734, color: "from-secondary/20 to-secondary/5" },
  { name: "North East", businessCount: 567, color: "from-primary/20 to-primary/5" },
  { name: "Upper East", businessCount: 823, color: "from-secondary/20 to-secondary/5" },
  { name: "Upper West", businessCount: 698, color: "from-primary/20 to-primary/5" },
  { name: "Bono", businessCount: 945, color: "from-secondary/20 to-secondary/5" },
  { name: "Bono East", businessCount: 712, color: "from-primary/20 to-primary/5" },
  { name: "Ahafo", businessCount: 534, color: "from-secondary/20 to-secondary/5" },
];

const RegionsShowcase = () => {
  const handleRegionClick = (regionName: string) => {
    console.log(`Clicked region: ${regionName}`);
    // Future: Navigate to /businesses?region=${regionName}
  };

  return (
    <section className="py-24 px-4 bg-gradient-subtle">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Discover Businesses Across Ghana
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connecting businesses from all 16 regions of Ghana. Find local partners, suppliers, and opportunities nationwide.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {regions.map((region, index) => (
            <Card
              key={region.name}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-elegant group animate-fade-in bg-gradient-to-br ${region.color} border-border/50 hover:border-primary/50`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleRegionClick(region.name)}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {region.name}
                </h3>
                <p className="text-3xl font-bold text-primary mb-1">
                  {region.businessCount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  businesses
                </p>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm text-primary font-medium">
                    Explore →
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <p className="text-muted-foreground">
            <span className="text-2xl font-bold text-primary">
              {regions.reduce((sum, region) => sum + region.businessCount, 0).toLocaleString()}
            </span>{" "}
            businesses connected across Ghana
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegionsShowcase;
