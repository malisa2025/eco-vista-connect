import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

export interface TravelData {
  tour_types: string[];
  group_size_min: string;
  group_size_max: string;
  provides_transport: boolean;
  provides_accommodation: boolean;
  provides_guide: boolean;
  languages_offered: string[];
}

interface TravelFieldsProps {
  value: TravelData;
  onChange: (data: TravelData) => void;
}

const TOUR_TYPES = [
  'Safari & Wildlife',
  'City Tours',
  'Cultural & Heritage',
  'Adventure & Hiking',
  'Beach & Coastal',
  'Eco Tourism',
  'Historical Sites',
  'Food & Culinary',
  'Photography Tours',
  'Business Travel',
];

const LANGUAGES = [
  'English',
  'French',
  'Twi',
  'Ga',
  'Ewe',
  'Hausa',
  'German',
  'Spanish',
  'Chinese',
];

const TravelFields = ({ value, onChange }: TravelFieldsProps) => {
  const handleTourTypeToggle = (tourType: string) => {
    const newTypes = value.tour_types.includes(tourType)
      ? value.tour_types.filter((t) => t !== tourType)
      : [...value.tour_types, tourType];
    onChange({ ...value, tour_types: newTypes });
  };

  const handleLanguageToggle = (language: string) => {
    const newLanguages = value.languages_offered.includes(language)
      ? value.languages_offered.filter((l) => l !== language)
      : [...value.languages_offered, language];
    onChange({ ...value, languages_offered: newLanguages });
  };

  return (
    <div className="space-y-6">
      {/* Tour Types */}
      <div>
        <Label className="text-base font-medium mb-3 block">Tour Types Offered</Label>
        <div className="grid grid-cols-2 gap-3">
          {TOUR_TYPES.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`tour-${type}`}
                checked={value.tour_types.includes(type)}
                onCheckedChange={() => handleTourTypeToggle(type)}
              />
              <label
                htmlFor={`tour-${type}`}
                className="text-sm cursor-pointer"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Group Size */}
      <div>
        <Label className="text-base font-medium mb-3 block">Group Size Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="group_size_min" className="text-sm text-muted-foreground">
              Minimum
            </Label>
            <Input
              id="group_size_min"
              type="number"
              min="1"
              placeholder="1"
              value={value.group_size_min}
              onChange={(e) => onChange({ ...value, group_size_min: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="group_size_max" className="text-sm text-muted-foreground">
              Maximum
            </Label>
            <Input
              id="group_size_max"
              type="number"
              min="1"
              placeholder="20"
              value={value.group_size_max}
              onChange={(e) => onChange({ ...value, group_size_max: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Services Provided */}
      <div>
        <Label className="text-base font-medium mb-3 block">Services Included</Label>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="provides_transport" className="text-sm font-medium">
                Transportation
              </Label>
              <p className="text-xs text-muted-foreground">
                Provide transport for tours
              </p>
            </div>
            <Switch
              id="provides_transport"
              checked={value.provides_transport}
              onCheckedChange={(checked) =>
                onChange({ ...value, provides_transport: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="provides_accommodation" className="text-sm font-medium">
                Accommodation
              </Label>
              <p className="text-xs text-muted-foreground">
                Arrange lodging for multi-day tours
              </p>
            </div>
            <Switch
              id="provides_accommodation"
              checked={value.provides_accommodation}
              onCheckedChange={(checked) =>
                onChange({ ...value, provides_accommodation: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="provides_guide" className="text-sm font-medium">
                Tour Guide
              </Label>
              <p className="text-xs text-muted-foreground">
                Professional guides available
              </p>
            </div>
            <Switch
              id="provides_guide"
              checked={value.provides_guide}
              onCheckedChange={(checked) =>
                onChange({ ...value, provides_guide: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Languages */}
      <div>
        <Label className="text-base font-medium mb-3 block">Languages Offered</Label>
        <div className="grid grid-cols-3 gap-3">
          {LANGUAGES.map((lang) => (
            <div key={lang} className="flex items-center space-x-2">
              <Checkbox
                id={`lang-${lang}`}
                checked={value.languages_offered.includes(lang)}
                onCheckedChange={() => handleLanguageToggle(lang)}
              />
              <label
                htmlFor={`lang-${lang}`}
                className="text-sm cursor-pointer"
              >
                {lang}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TravelFields;
