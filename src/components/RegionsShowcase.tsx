import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const filterRanges = [
  { id: 'all', label: 'All', min: 0, max: Infinity },
  { id: 'small', label: 'Small', min: 0, max: 749 },
  { id: 'medium', label: 'Medium', min: 750, max: 1499 },
  { id: 'large', label: 'Large', min: 1500, max: 2499 },
  { id: 'very-large', label: 'Very Large', min: 2500, max: Infinity },
];

const RegionsShowcase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  const handleRegionClick = (regionName: string) => {
    navigate(`/businesses?region=${encodeURIComponent(regionName)}`);
  };

  const filteredRegions = useMemo(() => {
    return regions.filter(region => {
      // Search filter
      const matchesSearch = region.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      // Business count filter
      const activeRange = filterRanges.find(f => f.id === activeFilter);
      if (!activeRange) return matchesSearch;
      
      const matchesFilter = region.businessCount >= activeRange.min && 
                           region.businessCount <= activeRange.max;
      
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  const getFilterCount = (filterId: string) => {
    const range = filterRanges.find(f => f.id === filterId);
    if (!range) return 0;
    
    return regions.filter(region => 
      region.businessCount >= range.min && 
      region.businessCount <= range.max &&
      region.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).length;
  };

  const totalFilteredBusinesses = filteredRegions.reduce(
    (sum, region) => sum + region.businessCount, 
    0
  );

  return (
    <section className="py-24 px-4 bg-gradient-subtle">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Discover Businesses Across Ghana
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connecting businesses from all 16 regions of Ghana. Find local partners, suppliers, and opportunities nationwide.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 max-w-4xl mx-auto space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {filterRanges.map((filter) => {
              const count = getFilterCount(filter.id);
              return (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  onClick={() => setActiveFilter(filter.id)}
                  className="transition-all"
                >
                  {filter.label} ({count})
                </Button>
              );
            })}
          </div>

          {/* Results Counter */}
          <p className="text-center text-sm text-muted-foreground">
            Showing {filteredRegions.length} of {regions.length} regions
          </p>
        </div>

        {filteredRegions.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredRegions.map((region, index) => (
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
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No regions found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <p className="text-muted-foreground">
            <span className="text-2xl font-bold text-primary">
              {totalFilteredBusinesses.toLocaleString()}
            </span>
            {filteredRegions.length < regions.length && (
              <span className="text-sm">
                {" "}of {regions.reduce((sum, region) => sum + region.businessCount, 0).toLocaleString()}
              </span>
            )}
            {" "}businesses {filteredRegions.length < regions.length ? `across ${filteredRegions.length} regions` : 'connected across Ghana'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegionsShowcase;
