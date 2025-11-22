import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessOwners } from '@/hooks/useBusinessClaims';
import { useBusinessAds, useAdMutations } from '@/hooks/useAdvertisements';
import RequestVerificationDialog from '@/components/business/RequestVerificationDialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useBusinessSubscription } from '@/hooks/useBusinessSubscription';
import { UsageMeter } from '@/components/subscriptions/UsageMeter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Eye, Star, Edit, Plus, TrendingUp, MousePointerClick, Briefcase, Users, MoreVertical, Play, Pause, Trash2, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBusinessJobs, useJobStats, useJobMutations } from '@/hooks/useJobs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BoostJobDialog from "@/components/jobs/BoostJobDialog";

const MyBusinesses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ownerships, isLoading } = useBusinessOwners(user?.id);
  const { subscription } = useBusinessSubscription(user?.id || "");

  const businesses = ownerships?.map(o => o.businesses).filter(Boolean) || [];
  const currentUsage = subscription?.current_usage as any || {};
  const planLimits = subscription?.subscription_plans?.limits as any || {};

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">My Businesses</h1>
              <p className="text-muted-foreground">Manage your business listings</p>
            </div>
            <Button onClick={() => navigate('/register-business')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </div>

          {businesses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Building2 className="h-20 w-20 text-muted-foreground/20 mb-4" />
                <h3 className="text-2xl font-bold mb-2">No businesses yet</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Start by registering your business to reach thousands of potential customers
                </p>
                <Button onClick={() => navigate('/register-business')}>
                  Register Your First Business
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Subscription Status Card */}
              {subscription && (
                <Card className="mb-6 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {subscription.subscription_plans?.name} Plan
                          <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                            {subscription.status}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your current subscription and usage
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => navigate('/manage-subscription')}>
                        Manage
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <UsageMeter
                        label="Jobs Posted"
                        current={currentUsage.jobs_posted || 0}
                        limit={planLimits.jobs_per_month || 0}
                      />
                      <UsageMeter
                        label="Featured Listings"
                        current={currentUsage.featured_listings || 0}
                        limit={planLimits.featured_listings || 0}
                      />
                      <UsageMeter
                        label="AI Credits"
                        current={currentUsage.ai_credits_used || 0}
                        limit={planLimits.ai_credits || 0}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="businesses" className="w-full">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
                <TabsTrigger value="businesses">My Businesses</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
                <TabsTrigger value="advertisements">Advertisements</TabsTrigger>
                <TabsTrigger value="jobs">Job Listings</TabsTrigger>
              </TabsList>

              <TabsContent value="businesses" className="space-y-6">
                {businesses.map((business: any) => (
                  <Card key={business.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            {business.logo_url ? (
                              <img
                                src={business.logo_url}
                                alt={business.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Building2 className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-xl mb-1">{business.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{business.category}</Badge>
                              <Badge variant="outline">{business.region}</Badge>
                              {business.is_verified && (
                                <Badge className="bg-primary/10 text-primary">Verified</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/businesses/${business.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          {!business.is_verified && (
                            <RequestVerificationDialog businessId={business.id} />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                            <Star className="h-5 w-5 fill-primary text-primary" />
                            {business.rating?.toFixed(1) || '0.0'}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {business.review_count || 0} reviews
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                            <Eye className="h-5 w-5" />
                            0
                          </div>
                          <p className="text-sm text-muted-foreground">views</p>
                        </div>
                        <div className="text-center">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate(`/businesses/${business.id}`)}
                          >
                            View Page
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="leads" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Lead Management</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      View and manage leads captured from your business profiles
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {businesses.length > 0 ? (
                      businesses.map((business: any) => (
                        <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{business.name}</h3>
                            <p className="text-sm text-muted-foreground">View leads for this business</p>
                          </div>
                          <Button onClick={() => navigate(`/leads/${business.id}`)}>
                            <Users2 className="h-4 w-4 mr-2" />
                            View Leads
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No businesses found. Register a business to start capturing leads.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advertisements" className="space-y-6">
                <BusinessAdvertisements businesses={businesses} />
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <BusinessJobs businesses={businesses} />
              </TabsContent>
            </Tabs>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const BusinessAdvertisements = ({ businesses }: { businesses: any[] }) => {
  const navigate = useNavigate();
  const { updateAdStatus } = useAdMutations();
  
  // Fetch ads for all businesses owned by the user
  const businessIds = businesses.map(b => b.id);
  const adsQueries = businessIds.map(id => useBusinessAds(id));
  
  // Combine all ads from all businesses
  const allAds = adsQueries.flatMap(query => query.data || []);
  const isLoading = adsQueries.some(query => query.isLoading);

  if (isLoading) {
    return <div className="text-center py-8">Loading advertisements...</div>;
  }

  if (allAds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <TrendingUp className="h-20 w-20 text-muted-foreground/20 mb-4" />
          <h3 className="text-2xl font-bold mb-2">No advertisements yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Start promoting your business by purchasing an advertisement spot
          </p>
          <Button onClick={() => navigate('/purchase-ad')}>
            <Plus className="h-4 w-4 mr-2" />
            Purchase Advertisement
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeAds = allAds.filter((ad: any) => ad.status === 'active');
  const pausedAds = allAds.filter((ad: any) => ad.status === 'paused');
  const expiredAds = allAds.filter((ad: any) => ad.status === 'expired');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{activeAds.length}</div>
              <p className="text-sm text-muted-foreground">Active Ads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {allAds.reduce((sum: number, ad: any) => sum + (ad.impressions || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Impressions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {allAds.reduce((sum: number, ad: any) => sum + (ad.total_clicks || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Your Advertisements</h3>
        <Button onClick={() => navigate('/purchase-ad')}>
          <Plus className="h-4 w-4 mr-2" />
          New Advertisement
        </Button>
      </div>

      {allAds.map((ad: any) => {
        const businessName = businesses.find(b => b.id === ad.business_id)?.name;
        const daysRemaining = Math.ceil((new Date(ad.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        return (
          <Card key={ad.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{ad.title}</CardTitle>
                    <Badge 
                      variant={
                        ad.status === 'active' ? 'default' : 
                        ad.status === 'paused' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {ad.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {businessName} • {ad.ad_spots?.name}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-2xl font-bold mb-1">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    {ad.impressions || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-2xl font-bold mb-1">
                    <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                    {ad.total_clicks || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Clicks</p>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">{ad.ctr}%</div>
                  <p className="text-sm text-muted-foreground">CTR</p>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">
                    {daysRemaining > 0 ? daysRemaining : 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Days Left</p>
                </div>
              </div>
              <div className="flex gap-2">
                {ad.status === 'active' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateAdStatus.mutate({ adId: ad.id, status: 'paused' })}
                    disabled={updateAdStatus.isPending}
                  >
                    Pause
                  </Button>
                )}
                {ad.status === 'paused' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateAdStatus.mutate({ adId: ad.id, status: 'active' })}
                    disabled={updateAdStatus.isPending}
                  >
                    Resume
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
                    View Ad
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const BusinessJobs = ({ businesses }: { businesses: any[] }) => {
  const navigate = useNavigate();
  const businessIds = businesses.map(b => b.id);
  const { data: jobs, isLoading } = useBusinessJobs(businessIds);
  const { data: stats } = useJobStats(businessIds);
  const { deleteJob } = useJobMutations();
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [boostJobId, setBoostJobId] = useState<string | null>(null);
  const [boostJobTitle, setBoostJobTitle] = useState<string>('');

  const handleDeleteConfirm = () => {
    if (deleteJobId) {
      deleteJob.mutate(deleteJobId);
      setDeleteJobId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Briefcase className="h-20 w-20 text-muted-foreground/20 mb-4" />
          <h3 className="text-2xl font-bold mb-2">No job listings yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Start hiring talented professionals by posting your first job
          </p>
          <Button onClick={() => navigate('/post-job')}>
            <Plus className="h-4 w-4 mr-2" />
            Post a Job
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{stats?.totalJobs || 0}</div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{stats?.activeJobs || 0}</div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{stats?.totalApplications || 0}</div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={() => navigate('/post-job')}>
        <Plus className="h-4 w-4 mr-2" />
        Post New Job
      </Button>

      {jobs.map((job: any) => (
        <Card key={job.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Badge>{job.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {job.businesses?.name} • Posted {formatDistanceToNow(new Date(job.created_at))} ago
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setBoostJobId(job.id);
                    setBoostJobTitle(job.title);
                  }}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Boost Job
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/job-performance/${job.id}`)}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Performance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/hiring-pipeline/${job.id}`)}>
                    <Users className="mr-2 h-4 w-4" />
                    Hiring Pipeline
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/job-applications/${job.id}`)}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    View Applications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/post-job?edit=${job.id}`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Job
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteJobId(job.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 text-2xl font-bold mb-1">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  {job.views_count || 0}
                </div>
                <p className="text-sm text-muted-foreground">Views</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-2xl font-bold mb-1">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  {job.applications_count || 0}
                </div>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">
                  {job.views_count > 0
                    ? ((job.applications_count / job.views_count) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Conv. Rate</p>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/job-performance/${job.id}`)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
              All applications will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BoostJobDialog
        open={!!boostJobId}
        onOpenChange={(open) => {
          if (!open) {
            setBoostJobId(null);
            setBoostJobTitle('');
          }
        }}
        jobId={boostJobId || ''}
        jobTitle={boostJobTitle}
      />
    </div>
  );
};

export default MyBusinesses;

