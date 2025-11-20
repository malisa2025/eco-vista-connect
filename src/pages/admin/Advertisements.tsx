import { useState } from 'react';
import { useAdminAdvertisements, useAdminAdvertisementStats } from '@/hooks/useAdminAdvertisements';
import { useAdMutations } from '@/hooks/useAdvertisements';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowUpDown, Eye, Pause, Play } from 'lucide-react';
import AdFilters from '@/components/admin/AdFilters';
import AdStatsCards from '@/components/admin/AdStatsCards';
import AdDetailsModal from '@/components/admin/AdDetailsModal';

const AdminAdvertisements = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    location: 'all',
    search: ''
  });
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { ads, isLoading, refetch, sortConfig, handleSort } = useAdminAdvertisements(filters);
  const { data: stats, isLoading: statsLoading } = useAdminAdvertisementStats();
  const { updateAdStatus } = useAdMutations();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  const getCTRColor = (ctr: string) => {
    const ctrNum = parseFloat(ctr);
    if (ctrNum >= 5) return 'text-green-600 dark:text-green-400';
    if (ctrNum >= 2) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleViewDetails = (ad: any) => {
    setSelectedAd(ad);
    setIsDetailsOpen(true);
  };

  const handleToggleStatus = (ad: any) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    updateAdStatus.mutate({ adId: ad.id, status: newStatus });
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
            <p className="text-muted-foreground">View and manage all advertisements with detailed analytics</p>
          </div>

          <AdStatsCards 
            stats={stats || { totalActiveAds: 0, totalImpressions: 0, totalClicks: 0, averageCTR: '0.00', totalRevenue: 0 }} 
            isLoading={statsLoading}
          />

          <Card>
            <CardHeader>
              <CardTitle>All Advertisements</CardTitle>
            </CardHeader>
            <CardContent>
              <AdFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                onRefresh={refetch}
              />

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                  ))}
                </div>
              ) : ads && ads.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Ad Spot</TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSort('status')}
                            className="flex items-center gap-1"
                          >
                            Status
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSort('impressions')}
                            className="flex items-center gap-1"
                          >
                            Impressions
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSort('total_clicks')}
                            className="flex items-center gap-1"
                          >
                            Clicks
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSort('ctr')}
                            className="flex items-center gap-1"
                          >
                            CTR
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSort('total_cost')}
                            className="flex items-center gap-1"
                          >
                            Cost
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads.map((ad: any) => {
                        const daysRemaining = ad.status === 'active' 
                          ? Math.ceil((new Date(ad.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : null;

                        return (
                          <TableRow key={ad.id}>
                            <TableCell className="font-medium max-w-[200px] truncate">{ad.title}</TableCell>
                            <TableCell>{ad.businesses?.name}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{ad.ad_spots?.name}</div>
                                <Badge variant="outline" className="text-xs">
                                  {ad.ad_spots?.location}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(ad.status)}>
                                {ad.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {new Date(ad.start_date).toLocaleDateString()} - {new Date(ad.end_date).toLocaleDateString()}
                                </div>
                                {daysRemaining !== null && daysRemaining > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {daysRemaining} days left
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{ad.impressions || 0}</TableCell>
                            <TableCell className="text-center">{ad.total_clicks || 0}</TableCell>
                            <TableCell className={`text-center font-medium ${getCTRColor(ad.ctr)}`}>
                              {ad.ctr}%
                            </TableCell>
                            <TableCell className="font-medium">${ad.total_cost}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(ad)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {(ad.status === 'active' || ad.status === 'paused') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleStatus(ad)}
                                    disabled={updateAdStatus.isPending}
                                  >
                                    {ad.status === 'active' ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">No advertisements found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <AdDetailsModal 
        ad={selectedAd}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default AdminAdvertisements;
