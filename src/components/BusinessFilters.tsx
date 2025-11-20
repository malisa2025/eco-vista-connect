import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useBusinessCategories } from "@/hooks/useBusinessCategories";

interface BusinessFiltersProps {
  search: string;
  category: string;
  region: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onClearFilters: () => void;
}

const regions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Northern",
  "Volta", "Central", "Upper East", "Upper West", "Brong-Ahafo",
  "Western North", "Savannah", "Bono East", "Ahafo", "Oti", "North East"
];

const BusinessFilters = ({
  search,
  category,
  region,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onRegionChange,
  onSortByChange,
  onClearFilters,
}: BusinessFiltersProps) => {
  const { data: categories, isLoading } = useBusinessCategories();

  const hasActiveFilters = search || category || region || sortBy !== 'newest';

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {!isLoading && categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={region} onValueChange={onRegionChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((reg) => (
              <SelectItem key={reg} value={reg}>
                {reg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={onClearFilters}
            title="Clear all filters"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BusinessFilters;