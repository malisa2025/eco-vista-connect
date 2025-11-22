import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useBusinessCategories } from "@/hooks/useBusinessCategories";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import SmartSearchInput from "@/components/search/SmartSearchInput";

interface BusinessFiltersProps {
  search: string;
  category: string;
  region: string;
  sortBy: string;
  openNow: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onOpenNowChange: (value: boolean) => void;
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
  openNow,
  onSearchChange,
  onCategoryChange,
  onRegionChange,
  onSortByChange,
  onOpenNowChange,
  onClearFilters,
}: BusinessFiltersProps) => {
  const { data: categories, isLoading } = useBusinessCategories();

  const hasActiveFilters = search || category || region || sortBy !== 'newest' || openNow;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SmartSearchInput
            value={search}
            onChange={onSearchChange}
            onSelect={onSearchChange}
            placeholder="Search businesses..."
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="openNow"
          checked={openNow}
          onCheckedChange={onOpenNowChange}
        />
        <Label
          htmlFor="openNow"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Open Now
        </Label>
      </div>
    </div>
  );
};

export default BusinessFilters;