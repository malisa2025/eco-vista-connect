import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/business/ImageUploader';
import { VideoUploader } from '@/components/business/VideoUploader';
import { GalleryManager } from '@/components/business/GalleryManager';
import { ProfileCompleteness } from '@/components/business/ProfileCompleteness';
import { useBusinessUpdate } from '@/hooks/useBusinessUpdate';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useBusinessCategories } from '@/hooks/useBusinessCategories';

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
  'Oti', 'Bono East', 'Ahafo', 'Savannah', 'North East', 'Western North'
];

export default function EditBusiness() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories } = useBusinessCategories();
  
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      // Check ownership
      const { data: ownership, error: ownershipError } = await supabase
        .from('business_owners')
        .select('*')
        .eq('business_id', id)
        .eq('user_id', user?.id)
        .single();

      if (ownershipError || !ownership) {
        throw new Error('You do not have permission to edit this business');
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const { mutate: updateBusiness, isPending } = useBusinessUpdate(id!);

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (business) {
      setFormData(business);
    }
  }, [business]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateBusiness(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Business not found or you don't have permission to edit it.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/my-businesses')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Business</h1>
              <p className="text-muted-foreground">{business.name}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <Tabs defaultValue="basic" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="name">Business Name</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={5}
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="region">Region</Label>
                        <Select
                          value={formData.region}
                          onValueChange={(value) => handleInputChange('region', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GHANA_REGIONS.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        rows={3}
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-6">
                    <ImageUploader
                      label="Business Logo"
                      currentImageUrl={formData.logo_url}
                      onUploadComplete={(url) => handleInputChange('logo_url', url)}
                      aspectRatio="square"
                    />

                    <ImageUploader
                      label="Hero Image"
                      currentImageUrl={formData.image_url}
                      onUploadComplete={(url) => handleInputChange('image_url', url)}
                      aspectRatio="16:9"
                    />

                    <GalleryManager
                      images={formData.gallery_images || []}
                      heroImage={formData.image_url}
                      onImagesChange={(images) => handleInputChange('gallery_images', images)}
                      onHeroImageChange={(url) => handleInputChange('image_url', url)}
                      autoSave={true}
                      businessId={id}
                    />

                    <VideoUploader
                      currentVideoUrl={formData.video_url}
                      onUploadComplete={(url, thumbnailUrl, duration) => {
                        handleInputChange('video_url', url);
                        if (thumbnailUrl) handleInputChange('video_thumbnail_url', thumbnailUrl);
                        if (duration) handleInputChange('video_duration', duration);
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.latitude || ''}
                          onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.longitude || ''}
                          onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter coordinates or use a map to set your business location
                    </p>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/my-businesses')}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isPending}
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </Card>
            </div>

            <div>
              <ProfileCompleteness business={formData} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
