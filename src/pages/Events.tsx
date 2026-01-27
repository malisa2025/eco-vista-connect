import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, List, MapPin } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import EventDetailModal from '@/components/events/EventDetailModal';
import EventCalendar from '@/components/events/EventCalendar';
import { useUpcomingEvents } from '@/hooks/useBusinessEvents';

const GHANA_REGIONS = [
  'All Regions',
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
  'Oti', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Western North'
];

export default function Events() {
  const { data: events, isLoading } = useUpcomingEvents(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Filter events
  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.businesses?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegion === 'All Regions' ||
      event.businesses?.region === selectedRegion;

    return matchesSearch && matchesRegion;
  }) || [];

  const handleViewDetails = (eventId: string) => {
    setSelectedEventId(eventId);
    setDetailModalOpen(true);
  };

  const handleRegister = (eventId: string) => {
    setSelectedEventId(eventId);
    setDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-primary/5 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Discover Events in Ghana
              </h1>
              <p className="text-muted-foreground">
                Find exciting events, workshops, and gatherings happening near you
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GHANA_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Events Content */}
        <div className="container mx-auto px-4 py-12">
          {/* View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {filteredEvents.length} Upcoming Event{filteredEvents.length !== 1 ? 's' : ''}
            </h2>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : viewMode === 'calendar' ? (
            <EventCalendar onEventClick={handleViewDetails} />
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No events found</h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedRegion !== 'All Regions'
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for upcoming events'}
              </p>
              {(searchQuery || selectedRegion !== 'All Regions') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRegion('All Regions');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onRegister={handleRegister}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Event Detail Modal */}
      <EventDetailModal
        eventId={selectedEventId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
