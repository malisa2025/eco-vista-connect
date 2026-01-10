import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export interface RetailData {
  store_type: string;
  online_store: boolean;
  accepts_momo: boolean;
}

interface RetailFieldsProps {
  data: RetailData;
  onChange: (data: RetailData) => void;
}

const storeTypes = [
  'Clothing & Fashion',
  'Electronics',
  'Grocery',
  'Pharmacy',
  'Hardware',
  'Furniture',
  'Beauty & Cosmetics',
  'Books & Stationery',
  'General Merchandise',
  'Other',
];

const RetailFields = ({ data, onChange }: RetailFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="store_type">Store Type</Label>
        <Select
          value={data.store_type}
          onValueChange={(value) => onChange({ ...data, store_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select store type" />
          </SelectTrigger>
          <SelectContent>
            {storeTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="online_store">Online Store</Label>
            <p className="text-sm text-muted-foreground">Do you sell products online?</p>
          </div>
          <Switch
            id="online_store"
            checked={data.online_store}
            onCheckedChange={(checked) => onChange({ ...data, online_store: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="accepts_momo">Mobile Money Payments</Label>
            <p className="text-sm text-muted-foreground">Accept MTN MoMo, Vodafone Cash, etc.</p>
          </div>
          <Switch
            id="accepts_momo"
            checked={data.accepts_momo}
            onCheckedChange={(checked) => onChange({ ...data, accepts_momo: checked })}
          />
        </div>
      </div>
    </div>
  );
};

export default RetailFields;
