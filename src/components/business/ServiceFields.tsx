import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export interface ServiceData {
  service_type: string;
  offers_consultation: boolean;
  home_service: boolean;
  years_experience: string;
}

interface ServiceFieldsProps {
  data: ServiceData;
  onChange: (data: ServiceData) => void;
}

const serviceTypes = [
  'Legal Services',
  'Accounting & Finance',
  'IT & Technology',
  'Marketing & Advertising',
  'Consulting',
  'Real Estate',
  'Insurance',
  'Education & Training',
  'Beauty & Personal Care',
  'Cleaning Services',
  'Repair & Maintenance',
  'Event Planning',
  'Other',
];

const ServiceFields = ({ data, onChange }: ServiceFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_type">Service Type</Label>
          <Select
            value={data.service_type}
            onValueChange={(value) => onChange({ ...data, service_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="years_experience">Years in Business</Label>
          <Input
            id="years_experience"
            type="number"
            placeholder="e.g., 5"
            value={data.years_experience}
            onChange={(e) => onChange({ ...data, years_experience: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="offers_consultation">Free Consultation</Label>
            <p className="text-sm text-muted-foreground">Offer initial free consultation</p>
          </div>
          <Switch
            id="offers_consultation"
            checked={data.offers_consultation}
            onCheckedChange={(checked) => onChange({ ...data, offers_consultation: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="home_service">Home/On-site Service</Label>
            <p className="text-sm text-muted-foreground">Provide services at client's location</p>
          </div>
          <Switch
            id="home_service"
            checked={data.home_service}
            onCheckedChange={(checked) => onChange({ ...data, home_service: checked })}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceFields;
