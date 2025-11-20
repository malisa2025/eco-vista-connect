import { useFeaturedBusinesses } from "@/hooks/useFeaturedBusinesses";
import BusinessCard from "./BusinessCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeaturedBusinesses = () => {
  const { data: businesses, isLoading } = useFeaturedBusinesses(6);
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured Businesses
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover verified businesses trusted by thousands across Ghana
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {businesses?.map((business) => (
                <BusinessCard key={business.id} {...business} />
              ))}
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={() => navigate("/businesses")}
                className="group"
              >
                View All Businesses
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedBusinesses;