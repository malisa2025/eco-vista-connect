import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import HotelCard from "@/components/hotels/HotelCard";
import { useHotelSearch } from "@/hooks/useHotelSearch";

const Hotels = () => {
  const [region, setRegion] = useState<string>("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: hotels, isLoading } = useHotelSearch({
    region,
    checkIn,
    checkOut,
    guests: parseInt(guests),
    searchQuery,
  });

  const handleSearch = () => {
    // Search is handled by the hook reactively
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Search Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Stay in Ghana
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover comfortable accommodations across Ghana's vibrant regions
            </p>
          </div>

          {/* Search Card */}
          <Card className="p-6 max-w-5xl mx-auto shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Location */}
              <div>
                <Label htmlFor="location" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                    <SelectItem value="Ashanti">Ashanti</SelectItem>
                    <SelectItem value="Central">Central</SelectItem>
                    <SelectItem value="Western">Western</SelectItem>
                    <SelectItem value="Eastern">Eastern</SelectItem>
                    <SelectItem value="Northern">Northern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Check-in */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Check-in
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {checkIn ? format(checkIn, "MMM dd") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={checkIn} onSelect={setCheckIn} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Check-out
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {checkOut ? format(checkOut, "MMM dd") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={checkOut} onSelect={setCheckOut} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Guests */}
              <div>
                <Label htmlFor="guests" className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  Guests
                </Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Guest{num > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Search Query */}
            <div className="mt-4">
              <Input
                placeholder="Search by hotel name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {hotels?.length || 0} Hotels Found
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-96 animate-pulse bg-muted" />
            ))}
          </div>
        ) : hotels && hotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel: any) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No hotels found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search filters.</p>
          </Card>
        )}
      </section>
    </div>
  );
};

export default Hotels;
