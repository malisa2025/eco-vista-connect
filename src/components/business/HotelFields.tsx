import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export interface HotelData {
  star_rating: string;
  total_rooms: string;
  check_in_time: string;
  check_out_time: string;
  amenities: string[];
}

interface HotelFieldsProps {
  data: HotelData;
  onChange: (data: HotelData) => void;
}

const amenityOptions = [
  { id: 'wifi', label: 'Free WiFi' },
  { id: 'parking', label: 'Parking' },
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'gym', label: 'Gym/Fitness Center' },
  { id: 'restaurant', label: 'On-site Restaurant' },
  { id: 'spa', label: 'Spa' },
  { id: 'room_service', label: '24/7 Room Service' },
  { id: 'ac', label: 'Air Conditioning' },
];

const HotelFields = ({ data, onChange }: HotelFieldsProps) => {
  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    const newAmenities = checked
      ? [...data.amenities, amenityId]
      : data.amenities.filter((a) => a !== amenityId);
    onChange({ ...data, amenities: newAmenities });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="star_rating">Star Rating</Label>
          <Select
            value={data.star_rating}
            onValueChange={(value) => onChange({ ...data, star_rating: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select star rating" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((stars) => (
                <SelectItem key={stars} value={stars.toString()}>
                  {'⭐'.repeat(stars)} {stars} Star{stars > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_rooms">Total Number of Rooms</Label>
          <Input
            id="total_rooms"
            type="number"
            placeholder="e.g., 25"
            value={data.total_rooms}
            onChange={(e) => onChange({ ...data, total_rooms: e.target.value })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="check_in_time">Check-in Time</Label>
          <Input
            id="check_in_time"
            type="time"
            value={data.check_in_time}
            onChange={(e) => onChange({ ...data, check_in_time: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="check_out_time">Check-out Time</Label>
          <Input
            id="check_out_time"
            type="time"
            value={data.check_out_time}
            onChange={(e) => onChange({ ...data, check_out_time: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Amenities</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {amenityOptions.map((amenity) => (
            <div key={amenity.id} className="flex items-center space-x-2">
              <Checkbox
                id={amenity.id}
                checked={data.amenities.includes(amenity.id)}
                onCheckedChange={(checked) => handleAmenityChange(amenity.id, !!checked)}
              />
              <Label htmlFor={amenity.id} className="text-sm cursor-pointer">
                {amenity.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelFields;
