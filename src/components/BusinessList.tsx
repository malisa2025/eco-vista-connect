import BusinessCard from "./BusinessCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";

interface Business {
  id: string;
  name: string;
  description: string | null;
  category: string;
  region: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  image_url: string | null;
  rating: number;
  review_count: number;
  is_verified: boolean;
}

interface BusinessListProps {
  businesses: Business[];
  isLoading?: boolean;
}

const BusinessList = ({ businesses, isLoading }: BusinessListProps) => {
  if (isLoading) {
    return (
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
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="w-20 h-20 text-muted-foreground/20 mb-4" />
        <h3 className="text-2xl font-bold mb-2">No businesses found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <BusinessCard key={business.id} {...business} />
      ))}
    </div>
  );
};

export default BusinessList;