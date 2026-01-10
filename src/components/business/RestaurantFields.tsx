import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export interface RestaurantData {
  cuisine_type: string;
  seating_capacity: string;
  accepts_reservations: boolean;
  delivery_available: boolean;
}

interface RestaurantFieldsProps {
  data: RestaurantData;
  onChange: (data: RestaurantData) => void;
}

const cuisineTypes = [
  'Ghanaian',
  'African',
  'Continental',
  'Chinese',
  'Indian',
  'Italian',
  'Fast Food',
  'Seafood',
  'Vegetarian',
  'Mixed',
  'Other',
];

const RestaurantFields = ({ data, onChange }: RestaurantFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cuisine_type">Cuisine Type</Label>
          <Select
            value={data.cuisine_type}
            onValueChange={(value) => onChange({ ...data, cuisine_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select cuisine type" />
            </SelectTrigger>
            <SelectContent>
              {cuisineTypes.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seating_capacity">Seating Capacity</Label>
          <Input
            id="seating_capacity"
            type="number"
            placeholder="e.g., 50"
            value={data.seating_capacity}
            onChange={(e) => onChange({ ...data, seating_capacity: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="accepts_reservations">Accept Reservations</Label>
            <p className="text-sm text-muted-foreground">Allow customers to book tables online</p>
          </div>
          <Switch
            id="accepts_reservations"
            checked={data.accepts_reservations}
            onCheckedChange={(checked) => onChange({ ...data, accepts_reservations: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="delivery_available">Delivery Available</Label>
            <p className="text-sm text-muted-foreground">Offer food delivery service</p>
          </div>
          <Switch
            id="delivery_available"
            checked={data.delivery_available}
            onCheckedChange={(checked) => onChange({ ...data, delivery_available: checked })}
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantFields;
