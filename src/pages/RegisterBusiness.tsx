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
import { Building2, Search } from 'lucide-react';
import { useBusinessCategories } from '@/hooks/useBusinessCategories';
import { useBusinesses } from '@/hooks/useBusinesses';
import { z } from 'zod';
import { toast } from 'sonner';

const newBusinessSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(1),
  region: z.string().min(1),
  description: z.string().max(500).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
});

const regions = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Oti',
  'Bono', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Western North'
];

const RegisterBusiness = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories } = useBusinessCategories();
  const { submitClaim } = useClaimMutations();
  const [activeTab, setActiveTab] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = newBusinessSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitClaim.mutateAsync({
        claim_type: 'new_business',
        business_data: formData,
      });
      navigate('/my-businesses');
    } catch (error) {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl gradient-hero mb-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
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
              <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  </form>
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
