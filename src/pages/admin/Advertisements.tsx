import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

const AdminAdvertisements = () => {
  const { data: ads, isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          businesses (name),
          ad_spots (name, location)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Advertisements Management
            </h1>
            <p className="text-muted-foreground">View and manage all advertisements</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Advertisements</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading advertisements...</p>
              ) : ads && ads.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Ad Spot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Impressions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map((ad: any) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell>{ad.businesses?.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ad.ad_spots?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(ad.status)}>
                            {ad.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(ad.start_date).toLocaleDateString()} - {new Date(ad.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${ad.total_cost}</TableCell>
                        <TableCell>{ad.impressions || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No advertisements found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAdvertisements;
