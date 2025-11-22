import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BusinessList from "@/components/BusinessList";
import BusinessFilters from "@/components/BusinessFilters";
import CategoryPills from "@/components/CategoryPills";
import { useBusinesses } from "@/hooks/useBusinesses";
import VerticalSponsoredVideos from "@/components/VerticalSponsoredVideos";
import { Building2 } from "lucide-react";

const Businesses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [region, setRegion] = useState(searchParams.get("region") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [openNow, setOpenNow] = useState(searchParams.get("openNow") === "true");

  const { data: businesses, isLoading } = useBusinesses({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    region: region !== "all" ? region : undefined,
    sortBy: sortBy as any,
    openNow: openNow || undefined,
  });

  useEffect(() => {
    const params: any = {};
    if (search) params.search = search;
    if (category !== "all") params.category = category;
    if (region !== "all") params.region = region;
    if (sortBy !== "newest") params.sort = sortBy;
    if (openNow) params.openNow = "true";
    
    setSearchParams(params);
  }, [search, category, region, sortBy, openNow, setSearchParams]);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("all");
    setRegion("all");
    setSortBy("newest");
    setOpenNow(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Business Directory
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Discover and connect with businesses across all regions of Ghana
              </p>
            </div>
          </div>
        </section>

        {/* Filters and Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-8">
                {/* Category Pills */}
                <CategoryPills
                  selectedCategory={category}
                  onCategorySelect={setCategory}
                />

                {/* Filters */}
                <BusinessFilters
                  search={search}
                  category={category}
                  region={region}
                  sortBy={sortBy}
                  openNow={openNow}
                  onSearchChange={setSearch}
                  onCategoryChange={setCategory}
                  onRegionChange={setRegion}
                  onSortByChange={setSortBy}
                  onOpenNowChange={setOpenNow}
                  onClearFilters={handleClearFilters}
                />

                {/* Results Count */}
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {isLoading ? (
                      "Loading businesses..."
                    ) : (
                      `${businesses?.length || 0} businesses found`
                    )}
                  </p>
                </div>

                {/* Business List */}
                <BusinessList
                  businesses={businesses || []}
                  isLoading={isLoading}
                />
              </div>

              {/* Sidebar with Sponsored Videos */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <VerticalSponsoredVideos limit={5} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Businesses;