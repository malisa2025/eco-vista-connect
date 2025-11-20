import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Database } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SeedDemoData() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<{
    jobs: boolean;
    ads: boolean;
    galleries: boolean;
  }>({ jobs: false, ads: false, galleries: false });

  const seedJobs = async () => {
    try {
      // Get first business for demo
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .limit(5);

      if (!businesses || businesses.length === 0) {
        throw new Error('No businesses found. Please add businesses first.');
      }

      const demoJobs = [
        {
          business_id: businesses[0].id,
          title: 'Senior Software Engineer',
          description: 'Join our dynamic team to build cutting-edge e-commerce solutions. We are looking for a talented software engineer with expertise in modern web technologies.',
          category: 'Technology',
          job_type: 'full_time' as const,
          experience_level: 'senior' as const,
          location: 'Accra, Greater Accra',
          salary_range: 'GHS 8,000 - 15,000/month',
          requirements: '• 5+ years of experience in software development\n• Proficiency in React, Node.js, and TypeScript\n• Experience with cloud platforms (AWS/Azure)\n• Strong problem-solving skills\n• Excellent communication abilities',
          responsibilities: '• Design and develop scalable web applications\n• Lead technical decisions and architecture\n• Mentor junior developers\n• Collaborate with cross-functional teams\n• Write clean, maintainable code',
          status: 'active' as const,
          posted_at: new Date().toISOString(),
        },
        {
          business_id: businesses[1]?.id || businesses[0].id,
          title: 'Digital Marketing Manager',
          description: 'Drive our digital marketing strategy and grow our online presence. Perfect for a creative marketer with a data-driven mindset.',
          category: 'Marketing',
          job_type: 'full_time' as const,
          experience_level: 'mid' as const,
          location: 'Kumasi, Ashanti',
          salary_range: 'GHS 5,000 - 9,000/month',
          requirements: '• 3+ years in digital marketing\n• Experience with SEO, SEM, and social media\n• Google Analytics and Ads certification\n• Content creation skills\n• Strong analytical mindset',
          responsibilities: '• Develop and execute digital marketing campaigns\n• Manage social media platforms\n• Analyze campaign performance\n• Optimize conversion rates\n• Collaborate with design team',
          status: 'active' as const,
          posted_at: new Date().toISOString(),
        },
        {
          business_id: businesses[2]?.id || businesses[0].id,
          title: 'Head Chef',
          description: 'Lead our kitchen team and create exceptional dining experiences. We are seeking a passionate chef with fine dining experience.',
          category: 'Hospitality',
          job_type: 'full_time' as const,
          experience_level: 'senior' as const,
          location: 'Airport Residential Area, Accra',
          salary_range: 'GHS 6,000 - 12,000/month',
          requirements: '• 7+ years culinary experience\n• Fine dining background\n• Menu planning and costing\n• Team leadership skills\n• Food safety certification',
          responsibilities: '• Oversee kitchen operations\n• Create innovative menu items\n• Train and manage kitchen staff\n• Ensure food quality and safety\n• Control food costs and inventory',
          status: 'active' as const,
          posted_at: new Date().toISOString(),
        },
        {
          business_id: businesses[3]?.id || businesses[0].id,
          title: 'Data Analyst',
          description: 'Transform data into actionable insights. Join our analytics team and drive data-driven decision making.',
          category: 'Technology',
          job_type: 'full_time' as const,
          experience_level: 'mid' as const,
          location: 'Kumasi, Ashanti',
          salary_range: 'GHS 5,500 - 9,500/month',
          requirements: '• Bachelor\'s in Statistics, Computer Science, or related field\n• 2-4 years data analysis experience\n• Proficiency in SQL, Python, or R\n• Experience with visualization tools\n• Strong analytical skills',
          responsibilities: '• Analyze complex datasets\n• Create data visualizations\n• Identify trends and patterns\n• Present findings to stakeholders\n• Collaborate with business teams',
          status: 'active' as const,
          posted_at: new Date().toISOString(),
        },
        {
          business_id: businesses[4]?.id || businesses[0].id,
          title: 'Sales Representative',
          description: 'Join our sales team and help grow our market presence. Ideal for motivated individuals with excellent communication skills.',
          category: 'Sales',
          job_type: 'full_time' as const,
          experience_level: 'entry' as const,
          location: 'Kumasi, Ashanti',
          salary_range: 'GHS 2,500 - 5,000/month + Commission',
          requirements: '• Bachelor\'s degree or equivalent\n• 1-2 years sales experience\n• Excellent communication skills\n• Self-motivated and target-driven\n• Valid driver\'s license',
          responsibilities: '• Identify new business opportunities\n• Build client relationships\n• Achieve sales targets\n• Prepare sales reports\n• Attend trade shows',
          status: 'active' as const,
          posted_at: new Date().toISOString(),
        },
      ];

      const { error } = await supabase.from('jobs').insert(demoJobs);
      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error seeding jobs:', error);
      throw error;
    }
  };

  const seedBusinessGalleries = async () => {
    try {
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id, category, name');

      if (!businesses || businesses.length === 0) {
        throw new Error('No businesses found');
      }

      // Map images based on category
      const updates = businesses.map((business) => {
        let galleryImages: string[] = [];
        let logoUrl = '';

        if (business.category === 'Retail' || business.category === 'Fashion') {
          galleryImages = [
            '/demo/fashion-hero.jpg',
            '/demo/fashion-logo.jpg',
            '/demo/tech-hero.jpg',
          ];
          logoUrl = '/demo/fashion-logo.jpg';
        } else if (business.category === 'Food & Beverage' || business.category === 'Restaurant') {
          galleryImages = [
            '/demo/restaurant-hero.jpg',
            '/demo/restaurant-logo.jpg',
            '/demo/fashion-hero.jpg',
          ];
          logoUrl = '/demo/restaurant-logo.jpg';
        } else if (business.category === 'Technology') {
          galleryImages = [
            '/demo/tech-hero.jpg',
            '/demo/tech-logo.jpg',
            '/demo/restaurant-hero.jpg',
          ];
          logoUrl = '/demo/tech-logo.jpg';
        } else {
          // Default mix for other categories
          galleryImages = [
            '/demo/fashion-hero.jpg',
            '/demo/restaurant-hero.jpg',
            '/demo/tech-hero.jpg',
          ];
          logoUrl = '/demo/fashion-logo.jpg';
        }

        return {
          id: business.id,
          gallery_images: galleryImages,
          image_url: galleryImages[0],
          logo_url: logoUrl,
        };
      });

      // Update all businesses
      for (const update of updates) {
        const { error } = await supabase
          .from('businesses')
          .update({
            gallery_images: update.gallery_images,
            image_url: update.image_url,
            logo_url: update.logo_url,
          })
          .eq('id', update.id);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error seeding galleries:', error);
      throw error;
    }
  };

  const seedAdvertisements = async () => {
    try {
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .limit(3);

      const { data: adSpots } = await supabase
        .from('ad_spots')
        .select('id, price_per_day')
        .limit(3);

      if (!businesses || !adSpots || businesses.length === 0 || adSpots.length === 0) {
        throw new Error('Missing businesses or ad spots');
      }

      const demoAds = [
        {
          business_id: businesses[0].id,
          ad_spot_id: adSpots[0].id,
          title: 'Grand Opening Special - 50% Off!',
          description: 'Visit us this weekend for amazing deals and exclusive offers',
          image_url: '/demo/fashion-hero.jpg',
          link_url: '/businesses',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: adSpots[0].price_per_day * 30,
          status: 'active' as const,
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        },
        {
          business_id: businesses[1]?.id || businesses[0].id,
          ad_spot_id: adSpots[1]?.id || adSpots[0].id,
          title: 'Premium Services Now Available',
          description: 'Experience excellence with our new premium offerings',
          image_url: '/demo/tech-hero.jpg',
          link_url: '/businesses',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (adSpots[1]?.price_per_day || adSpots[0].price_per_day) * 30,
          status: 'active' as const,
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        },
        {
          business_id: businesses[2]?.id || businesses[0].id,
          ad_spot_id: adSpots[2]?.id || adSpots[0].id,
          title: 'Fresh Arrivals Daily',
          description: 'Shop the latest products at unbeatable prices',
          image_url: '/demo/restaurant-hero.jpg',
          link_url: '/businesses',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (adSpots[2]?.price_per_day || adSpots[0].price_per_day) * 30,
          status: 'active' as const,
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        },
      ];

      const { error } = await supabase.from('advertisements').insert(demoAds);
      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error seeding advertisements:', error);
      throw error;
    }
  };

  const handleSeedJobs = async () => {
    setIsSeeding(true);
    try {
      await seedJobs();
      setSeedStatus((prev) => ({ ...prev, jobs: true }));
      toast({
        title: 'Success!',
        description: '5 demo jobs have been added',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to seed jobs',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedAds = async () => {
    setIsSeeding(true);
    try {
      await seedAdvertisements();
      setSeedStatus((prev) => ({ ...prev, ads: true }));
      toast({
        title: 'Success!',
        description: '3 demo advertisements have been added',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to seed ads',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedGalleries = async () => {
    setIsSeeding(true);
    try {
      await seedBusinessGalleries();
      setSeedStatus((prev) => ({ ...prev, galleries: true }));
      toast({
        title: 'Success!',
        description: 'Image galleries added to all businesses',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to seed galleries',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedAll = async () => {
    setIsSeeding(true);
    try {
      await seedJobs();
      setSeedStatus((prev) => ({ ...prev, jobs: true }));
      
      await seedAdvertisements();
      setSeedStatus((prev) => ({ ...prev, ads: true }));

      await seedBusinessGalleries();
      setSeedStatus((prev) => ({ ...prev, galleries: true }));

      toast({
        title: 'Success!',
        description: 'All demo data has been seeded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to seed demo data',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Database className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-2">Seed Demo Data</h1>
            <p className="text-muted-foreground">
              Add demo job listings and advertisements to your platform
            </p>
          </div>

          <Card className="p-8">
            <div className="space-y-6">
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Demo Jobs</h3>
                    <p className="text-sm text-muted-foreground">5 sample job listings</p>
                  </div>
                  {seedStatus.jobs && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <Button
                  onClick={handleSeedJobs}
                  disabled={isSeeding || seedStatus.jobs}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {seedStatus.jobs ? 'Jobs Seeded' : 'Seed Jobs Only'}
                </Button>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Demo Advertisements</h3>
                    <p className="text-sm text-muted-foreground">3 sample ads</p>
                  </div>
                  {seedStatus.ads && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <Button
                  onClick={handleSeedAds}
                  disabled={isSeeding || seedStatus.ads}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {seedStatus.ads ? 'Ads Seeded' : 'Seed Ads Only'}
                </Button>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Business Galleries</h3>
                    <p className="text-sm text-muted-foreground">Add image galleries to all businesses</p>
                  </div>
                  {seedStatus.galleries && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <Button
                  onClick={handleSeedGalleries}
                  disabled={isSeeding || seedStatus.galleries}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {seedStatus.galleries ? 'Galleries Seeded' : 'Seed Galleries Only'}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSeedAll}
                  disabled={isSeeding}
                  className="w-full"
                  size="lg"
                >
                  {isSeeding && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isSeeding ? 'Seeding All Data...' : 'Seed All Demo Data'}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                You can seed individual data types above or use "Seed All" to populate everything at once.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
