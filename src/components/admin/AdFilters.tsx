import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface AdFiltersProps {
  filters: {
    status: string;
    location: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onRefresh: () => void;
}

const AdFilters = ({ filters, onFilterChange, onRefresh }: AdFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or business name..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="pending_payment">Pending Payment</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.location} onValueChange={(value) => onFilterChange('location', value)}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Filter by location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          <SelectItem value="home_hero">Home Hero</SelectItem>
          <SelectItem value="home_sidebar">Home Sidebar</SelectItem>
          <SelectItem value="business_list_top">Business List Top</SelectItem>
          <SelectItem value="business_detail_sidebar">Business Detail Sidebar</SelectItem>
          <SelectItem value="search_results">Search Results</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AdFilters;
