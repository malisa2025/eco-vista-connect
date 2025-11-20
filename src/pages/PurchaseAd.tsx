import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessOwners } from '@/hooks/useBusinessClaims';
import { useAdSpots, useAdMutations } from '@/hooks/useAdvertisements';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { supabase } from '@/integrations/supabase/client';

const PurchaseAd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ownerships } = useBusinessOwners(user?.id);
  const { data: adSpots } = useAdSpots();
  const { createAd } = useAdMutations();

  const [formData, setFormData] = useState({
    business_id: '',
    ad_spot_id: '',
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    start_date: '',
    end_date: '',
  });

  const selectedSpot = adSpots?.find((s) => s.id === formData.ad_spot_id);
  const daysDiff = formData.start_date && formData.end_date
    ? Math.ceil(
        (new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 0;
  const totalCost = selectedSpot && daysDiff > 0 ? selectedSpot.price_per_day * daysDiff : 0;

  const handlePayment = async () => {
    if (!formData.business_id || !formData.ad_spot_id || !formData.title || !formData.image_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (totalCost <= 0) {
      toast.error('Invalid ad duration');
      return;
    }

    try {
      // Create the advertisement first
      const ad = await createAd.mutateAsync({
        ...formData,
        total_cost: totalCost,
      });

      // Initialize Paystack payment
      const config = {
        reference: `ad_${ad.id}_${Date.now()}`,
        email: user?.email || '',
        amount: Math.round(totalCost * 100), // Convert to kobo
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
        metadata: {
          advertisement_id: ad.id,
          business_id: formData.business_id,
          custom_fields: [],
        },
      };

      const initializePayment = usePaystackPayment(config);
      
      initializePayment({
        onSuccess: async (reference: any) => {
          toast.success('Payment successful! Verifying...');
          
          // Verify payment with our edge function
          const { error } = await supabase.functions.invoke('verify-paystack-payment', {
            body: { reference: reference.reference },
          });

          if (error) {
            toast.error('Payment verification failed. Please contact support.');
            console.error('Verification error:', error);
          } else {
            toast.success('Advertisement activated successfully!');
            navigate('/my-businesses');
          }
        },
        onClose: () => {
          toast.error('Payment cancelled');
        }
      });
    } catch (error) {
      console.error('Error creating advertisement:', error);
      toast.error('Failed to create advertisement');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handlePayment();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Purchase Advertisement
            </h1>
            <p className="text-muted-foreground mt-2">
              Boost your business visibility with premium ad placements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ad Spots */}
            <div className="md:col-span-1 space-y-4">
              <h2 className="font-semibold text-lg">Available Ad Spots</h2>
              {adSpots?.map((spot) => (
                <Card
                  key={spot.id}
                  className={`cursor-pointer transition-colors ${
                    formData.ad_spot_id === spot.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, ad_spot_id: spot.id })}
                >
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {spot.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{spot.description}</p>
                    <Badge variant="secondary">${spot.price_per_day}/day</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Advertisement Details</CardTitle>
                <CardDescription>Create your advertisement campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Business</Label>
                    <Select
                      value={formData.business_id}
                      onValueChange={(value) => setFormData({ ...formData, business_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a business" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownerships?.map((ownership: any) => (
                          <SelectItem key={ownership.businesses.id} value={ownership.businesses.id}>
                            {ownership.businesses.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ad Title</Label>
                    <Input
                      placeholder="Catchy title for your ad"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Brief description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {totalCost > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Duration:</span>
                        <span className="font-semibold">{daysDiff} days</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Total Cost:</span>
                        <span className="text-2xl font-bold text-primary">${totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={createAd.isPending}>
                    {createAd.isPending ? 'Creating...' : 'Purchase Advertisement'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PurchaseAd;
