import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface PreferencesSectionProps {
  preferredJobTypes: string[];
  preferredLocations: string[];
  salaryExpectation: string;
  availability: string;
  onJobTypesChange: (types: string[]) => void;
  onLocationsChange: (locations: string[]) => void;
  onSalaryChange: (salary: string) => void;
  onAvailabilityChange: (availability: string) => void;
}

const JOB_TYPES = ["full_time", "part_time", "contract", "internship"];
const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Central", "Eastern",
  "Volta", "Northern", "Upper East", "Upper West", "Bono",
  "Bono East", "Ahafo", "Savannah", "North East", "Oti", "Western North"
];

const PreferencesSection = ({
  preferredJobTypes,
  preferredLocations,
  salaryExpectation,
  availability,
  onJobTypesChange,
  onLocationsChange,
  onSalaryChange,
  onAvailabilityChange,
}: PreferencesSectionProps) => {
  const toggleJobType = (type: string) => {
    if (preferredJobTypes.includes(type)) {
      onJobTypesChange(preferredJobTypes.filter((t) => t !== type));
    } else {
      onJobTypesChange([...preferredJobTypes, type]);
    }
  };

  const toggleLocation = (location: string) => {
    if (preferredLocations.includes(location)) {
      onLocationsChange(preferredLocations.filter((l) => l !== location));
    } else {
      onLocationsChange([...preferredLocations, location]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Preferred Job Types</Label>
        <div className="grid grid-cols-2 gap-3">
          {JOB_TYPES.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={preferredJobTypes.includes(type)}
                onCheckedChange={() => toggleJobType(type)}
              />
              <label
                htmlFor={type}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Preferred Locations (Select multiple)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border rounded-md">
          {GHANA_REGIONS.map((region) => (
            <div key={region} className="flex items-center space-x-2">
              <Checkbox
                id={region}
                checked={preferredLocations.includes(region)}
                onCheckedChange={() => toggleLocation(region)}
              />
              <label
                htmlFor={region}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {region}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="salary">Expected Salary Range</Label>
        <Input
          id="salary"
          value={salaryExpectation}
          onChange={(e) => onSalaryChange(e.target.value)}
          placeholder="e.g., GHS 5,000 - 8,000 per month"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Select value={availability} onValueChange={onAvailabilityChange}>
          <SelectTrigger id="availability">
            <SelectValue placeholder="Select availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediate</SelectItem>
            <SelectItem value="2_weeks">2 Weeks Notice</SelectItem>
            <SelectItem value="1_month">1 Month Notice</SelectItem>
            <SelectItem value="2_months">2 Months Notice</SelectItem>
            <SelectItem value="negotiable">Negotiable</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PreferencesSection;
