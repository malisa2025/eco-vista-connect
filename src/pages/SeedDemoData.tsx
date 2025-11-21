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
  const [isDeletingAds, setIsDeletingAds] = useState(false);
  const [seedStatus, setSeedStatus] = useState<{
    jobs: boolean;
    ads: boolean;
    galleries: boolean;
  }>({ jobs: false, ads: false, galleries: false });

  const seedJobs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        body: { action: 'jobs' },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to seed jobs');

      return true;
    } catch (error) {
      console.error('Error seeding jobs:', error);
      throw error;
    }
  };

  const seedBusinessGalleries = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        body: { action: 'galleries' },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to seed galleries');

      return true;
    } catch (error) {
      console.error('Error seeding galleries:', error);
      throw error;
    }
  };

  const seedAdvertisements = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        body: { action: 'advertisements' },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to seed advertisements');

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
        description: '11 demo advertisements have been added (9 videos + 2 images)',
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

  const handleDeleteAds = async () => {
    setIsDeletingAds(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        body: { action: 'delete_advertisements' },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to delete advertisements');

      setSeedStatus((prev) => ({ ...prev, ads: false }));
      toast({
        title: 'Success!',
        description: 'All advertisements have been deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete ads',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAds(false);
    }
  };

  const handleSeedAll = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        body: { action: 'all' },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to seed all data');

      setSeedStatus({ jobs: true, ads: true, galleries: true });
      
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
                    <p className="text-sm text-muted-foreground">11 sample ads (9 videos + 2 images)</p>
                  </div>
                  {seedStatus.ads && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSeedAds}
                    disabled={isSeeding || isDeletingAds || seedStatus.ads}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {seedStatus.ads ? 'Ads Seeded' : 'Seed Ads Only'}
                  </Button>
                  <Button
                    onClick={handleDeleteAds}
                    disabled={isSeeding || isDeletingAds}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                  >
                    {isDeletingAds && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete All Ads
                  </Button>
                </div>
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
