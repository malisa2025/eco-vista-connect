import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, Hotel, ShoppingBag, Briefcase, Heart, Building2 } from 'lucide-react';

export type BusinessType = 'restaurant' | 'hotel' | 'retail' | 'services' | 'healthcare' | 'other';

interface BusinessTypeOption {
  type: BusinessType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const businessTypes: BusinessTypeOption[] = [
  {
    type: 'restaurant',
    label: 'Restaurant / Food',
    description: 'Restaurants, cafes, bakeries, food delivery',
    icon: UtensilsCrossed,
  },
  {
    type: 'hotel',
    label: 'Hotel / Accommodation',
    description: 'Hotels, guest houses, lodges, vacation rentals',
    icon: Hotel,
  },
  {
    type: 'retail',
    label: 'Retail / Shop',
    description: 'Stores, markets, boutiques, e-commerce',
    icon: ShoppingBag,
  },
  {
    type: 'services',
    label: 'Professional Services',
    description: 'Consulting, agencies, freelance services',
    icon: Briefcase,
  },
  {
    type: 'healthcare',
    label: 'Healthcare',
    description: 'Clinics, pharmacies, hospitals, wellness',
    icon: Heart,
  },
  {
    type: 'other',
    label: 'Other Business',
    description: 'Any other type of business',
    icon: Building2,
  },
];

interface BusinessTypeSelectorProps {
  value: BusinessType | null;
  onChange: (type: BusinessType) => void;
}

const BusinessTypeSelector = ({ value, onChange }: BusinessTypeSelectorProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {businessTypes.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.type;
        
        return (
          <Card
            key={option.type}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onChange(option.type)}
          >
            <CardContent className="p-6 text-center">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BusinessTypeSelector;
