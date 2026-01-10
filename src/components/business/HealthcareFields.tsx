import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

export interface HealthcareData {
  facility_type: string;
  emergency_services: boolean;
  accepts_insurance: boolean;
  specialties: string[];
}

interface HealthcareFieldsProps {
  data: HealthcareData;
  onChange: (data: HealthcareData) => void;
}

const facilityTypes = [
  'Hospital',
  'Clinic',
  'Pharmacy',
  'Dental Clinic',
  'Eye Clinic',
  'Laboratory',
  'Diagnostic Center',
  'Physiotherapy',
  'Mental Health',
  'Veterinary',
  'Other',
];

const specialtyOptions = [
  { id: 'general', label: 'General Practice' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'gynecology', label: 'Gynecology' },
  { id: 'cardiology', label: 'Cardiology' },
  { id: 'dermatology', label: 'Dermatology' },
  { id: 'orthopedics', label: 'Orthopedics' },
  { id: 'surgery', label: 'Surgery' },
  { id: 'neurology', label: 'Neurology' },
];

const HealthcareFields = ({ data, onChange }: HealthcareFieldsProps) => {
  const handleSpecialtyChange = (specialtyId: string, checked: boolean) => {
    const newSpecialties = checked
      ? [...data.specialties, specialtyId]
      : data.specialties.filter((s) => s !== specialtyId);
    onChange({ ...data, specialties: newSpecialties });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="facility_type">Facility Type</Label>
        <Select
          value={data.facility_type}
          onValueChange={(value) => onChange({ ...data, facility_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select facility type" />
          </SelectTrigger>
          <SelectContent>
            {facilityTypes.map((type) => (
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
            <Label htmlFor="emergency_services">Emergency Services</Label>
            <p className="text-sm text-muted-foreground">24/7 emergency care available</p>
          </div>
          <Switch
            id="emergency_services"
            checked={data.emergency_services}
            onCheckedChange={(checked) => onChange({ ...data, emergency_services: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="accepts_insurance">Accept Health Insurance</Label>
            <p className="text-sm text-muted-foreground">NHIS and private insurance accepted</p>
          </div>
          <Switch
            id="accepts_insurance"
            checked={data.accepts_insurance}
            onCheckedChange={(checked) => onChange({ ...data, accepts_insurance: checked })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Specialties (if applicable)</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {specialtyOptions.map((specialty) => (
            <div key={specialty.id} className="flex items-center space-x-2">
              <Checkbox
                id={specialty.id}
                checked={data.specialties.includes(specialty.id)}
                onCheckedChange={(checked) => handleSpecialtyChange(specialty.id, !!checked)}
              />
              <Label htmlFor={specialty.id} className="text-sm cursor-pointer">
                {specialty.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthcareFields;
