import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClaimMutations } from '@/hooks/useBusinessClaims';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import logoImage from '@/assets/logo-ghkonect.jpg';
import { useBusinessCategories } from '@/hooks/useBusinessCategories';
import { useBusinesses } from '@/hooks/useBusinesses';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import BusinessTypeSelector, { BusinessType } from '@/components/business/BusinessTypeSelector';
import RestaurantFields, { RestaurantData } from '@/components/business/RestaurantFields';
import HotelFields, { HotelData } from '@/components/business/HotelFields';
import RetailFields, { RetailData } from '@/components/business/RetailFields';
import ServiceFields, { ServiceData } from '@/components/business/ServiceFields';
import HealthcareFields, { HealthcareData } from '@/components/business/HealthcareFields';

const newBusinessSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(1),
  region: z.string().min(1),
  description: z.string().max(500).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string()
    .transform((val) => val.trim())
    .refine(
      (val) => {
        if (!val || val === '') return true;
        try {
          const urlToTest = val.startsWith('http://') || val.startsWith('https://') 
            ? val 
            : `https://${val}`;
          new URL(urlToTest);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid website URL (e.g., example.com)' }
    )
    .optional(),
  address: z.string().optional(),
});

const regions = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Oti',
  'Bono', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Western North'
];

const steps = [
  { id: 1, name: 'Business Type' },
  { id: 2, name: 'Basic Info' },
  { id: 3, name: 'Details' },
  { id: 4, name: 'Review' },
];

const RegisterBusiness = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories } = useBusinessCategories();
  const { submitClaim } = useClaimMutations();
  const [activeTab, setActiveTab] = useState('new');
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);

  const { data: searchResults } = useBusinesses({
    search: searchQuery,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    region: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
  });

  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    cuisine_type: '',
    seating_capacity: '',
    accepts_reservations: false,
    delivery_available: false,
  });

  const [hotelData, setHotelData] = useState<HotelData>({
    star_rating: '',
    total_rooms: '',
    check_in_time: '14:00',
    check_out_time: '11:00',
    amenities: [],
  });

  const [retailData, setRetailData] = useState<RetailData>({
    store_type: '',
    online_store: false,
    accepts_momo: true,
  });

  const [serviceData, setServiceData] = useState<ServiceData>({
    service_type: '',
    offers_consultation: false,
    home_service: false,
    years_experience: '',
  });

  const [healthcareData, setHealthcareData] = useState<HealthcareData>({
    facility_type: '',
    emergency_services: false,
    accepts_insurance: true,
    specialties: [],
  });

  const handleClaimExisting = async () => {
    if (!selectedBusiness) {
      toast.error('Please select a business to claim');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitClaim.mutateAsync({
        business_id: selectedBusiness,
        claim_type: 'claim_existing',
      });
      navigate('/my-businesses');
    } catch (error) {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeSpecificData = (): Record<string, unknown> | null => {
    switch (businessType) {
      case 'restaurant':
        return { ...restaurantData };
      case 'hotel':
        return { ...hotelData };
      case 'retail':
        return { ...retailData };
      case 'services':
        return { ...serviceData };
      case 'healthcare':
        return { ...healthcareData };
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    const result = newBusinessSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitClaim.mutateAsync({
        claim_type: 'new_business',
        business_data: {
          ...formData,
          business_type: businessType,
          type_specific_data: getTypeSpecificData(),
        },
      });
      navigate('/my-businesses');
    } catch (error) {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return businessType !== null;
      case 2:
        return formData.name && formData.category && formData.region;
      case 3:
        return true; // Type-specific fields are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (businessType) {
      case 'restaurant':
        return <RestaurantFields data={restaurantData} onChange={setRestaurantData} />;
      case 'hotel':
        return <HotelFields data={hotelData} onChange={setHotelData} />;
      case 'retail':
        return <RetailFields data={retailData} onChange={setRetailData} />;
      case 'services':
        return <ServiceFields data={serviceData} onChange={setServiceData} />;
      case 'healthcare':
        return <HealthcareFields data={healthcareData} onChange={setHealthcareData} />;
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p>No additional details needed for this business type.</p>
            <p className="text-sm mt-2">You can proceed to review your submission.</p>
          </div>
        );
    }
  };

  const getBusinessTypeLabel = () => {
    const labels: Record<BusinessType, string> = {
      restaurant: 'Restaurant / Food',
      hotel: 'Hotel / Accommodation',
      retail: 'Retail / Shop',
      services: 'Professional Services',
      healthcare: 'Healthcare',
      other: 'Other Business',
    };
    return businessType ? labels[businessType] : '';
  };

  const renderReviewSection = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Business Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{getBusinessTypeLabel()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{formData.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Region:</span>
              <span className="font-medium">{formData.region}</span>
            </div>
            {formData.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{formData.phone}</span>
              </div>
            )}
            {formData.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{formData.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Type-Specific Details</h3>
          <div className="space-y-2 text-sm">
            {businessType === 'restaurant' && (
              <>
                {restaurantData.cuisine_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cuisine:</span>
                    <span className="font-medium">{restaurantData.cuisine_type}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reservations:</span>
                  <span className="font-medium">{restaurantData.accepts_reservations ? 'Yes' : 'No'}</span>
                </div>
              </>
            )}
            {businessType === 'hotel' && (
              <>
                {hotelData.star_rating && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="font-medium">{hotelData.star_rating} Stars</span>
                  </div>
                )}
                {hotelData.total_rooms && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rooms:</span>
                    <span className="font-medium">{hotelData.total_rooms}</span>
                  </div>
                )}
              </>
            )}
            {businessType === 'retail' && retailData.store_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Store Type:</span>
                <span className="font-medium">{retailData.store_type}</span>
              </div>
            )}
            {businessType === 'services' && serviceData.service_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Type:</span>
                <span className="font-medium">{serviceData.service_type}</span>
              </div>
            )}
            {businessType === 'healthcare' && healthcareData.facility_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Facility Type:</span>
                <span className="font-medium">{healthcareData.facility_type}</span>
              </div>
            )}
            {businessType === 'other' && (
              <p className="text-muted-foreground">No additional details provided.</p>
            )}
          </div>
        </div>
      </div>

      {formData.description && (
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Description</h3>
          <p className="text-sm text-muted-foreground">{formData.description}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <img 
              src={logoImage} 
              alt="GHKonect Logo" 
              className="w-16 h-16 rounded-xl object-cover mx-auto mb-4"
            />
            <h1 className="text-4xl font-display font-bold mb-2">Register Your Business</h1>
            <p className="text-muted-foreground">
              Get your business listed on GHKonect and reach thousands of potential customers
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Business Registration</CardTitle>
              <CardDescription>
                Choose whether to claim an existing business or add a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCurrentStep(1); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="claim">Claim Existing</TabsTrigger>
                  <TabsTrigger value="new">Add New Business</TabsTrigger>
                </TabsList>

                <TabsContent value="claim" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Search for your business</Label>
                      <Input
                        placeholder="Enter business name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {searchResults && searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map((business) => (
                          <Card
                            key={business.id}
                            className={`cursor-pointer transition-colors ${
                              selectedBusiness === business.id
                                ? 'border-primary'
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedBusiness(business.id)}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold">{business.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {business.category} • {business.region}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                        <Button
                          className="w-full mt-4"
                          onClick={handleClaimExisting}
                          disabled={!selectedBusiness || isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Claim This Business'}
                        </Button>
                      </div>
                    ) : searchQuery ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No businesses found. Try a different search or add a new business.
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Search for your business to claim ownership
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="new">
                  {/* Progress indicator */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      {steps.map((step) => (
                        <div
                          key={step.id}
                          className={`flex items-center ${
                            step.id === currentStep
                              ? 'text-primary font-medium'
                              : step.id < currentStep
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 ${
                              step.id < currentStep
                                ? 'bg-primary text-primary-foreground'
                                : step.id === currentStep
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                          </div>
                          <span className="hidden sm:inline">{step.name}</span>
                        </div>
                      ))}
                    </div>
                    <Progress value={(currentStep / steps.length) * 100} className="h-2" />
                  </div>

                  {/* Step 1: Business Type */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold">What type of business are you registering?</h2>
                        <p className="text-muted-foreground mt-1">
                          This helps us customize your dashboard and features
                        </p>
                      </div>
                      <BusinessTypeSelector value={businessType} onChange={setBusinessType} />
                    </div>
                  )}

                  {/* Step 2: Basic Info */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Business Name *</Label>
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.name} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="region">Region *</Label>
                          <Select
                            value={formData.region}
                            onValueChange={(value) => setFormData({ ...formData, region: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          rows={4}
                          maxLength={500}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.description.length}/500
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Type-specific details */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold">
                          {businessType === 'other' ? 'Additional Information' : `${getBusinessTypeLabel()} Details`}
                        </h2>
                        <p className="text-muted-foreground mt-1">
                          These details help customers find and understand your business better
                        </p>
                      </div>
                      {renderTypeSpecificFields()}
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold">Review Your Submission</h2>
                        <p className="text-muted-foreground mt-1">
                          Please review the information below before submitting
                        </p>
                      </div>
                      {renderReviewSection()}
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>

                    {currentStep < 4 ? (
                      <Button onClick={nextStep} disabled={!canProceed()}>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                        <Check className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterBusiness;
