import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdminSubscriptions,
  useSubscriptionAnalytics,
  useAdminSubscriptionMutations,
} from '@/hooks/useAdminSubscriptions';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { CohortTable } from '@/components/admin/CohortTable';
import { exportSubscriptionsToCSV } from '@/lib/exportSubscriptionsCSV';
import {
  Users,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Search,
  Download,
  MoreVertical,
  Eye,
  Calendar,
  XCircle,
  Mail,
  FileText,
} from 'lucide-react';

const Subscriptions = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const [timeRange, setTimeRange] = useState('30days');
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');

  const { data: subscriptions = [], isLoading } = useAdminSubscriptions(filters);
  const { data: analytics } = useSubscriptionAnalytics(timeRange);
  const { extendSubscription, cancelSubscription, addAdminNote } =
    useAdminSubscriptionMutations();

  const handleExport = () => {
    exportSubscriptionsToCSV(subscriptions);
  };

  const handleSaveNote = () => {
    if (selectedSub) {
      addAdminNote.mutate({ id: selectedSub.id, note: adminNote });
      setAdminNote('');
    }
  };

  const getStatusBadge = (status: string, endDate: string) => {
    const isExpired = new Date(endDate) < new Date();
    
    if (status === 'active' && !isExpired) {
      return <Badge variant="default">Active</Badge>;
    } else if (status === 'cancelled') {
      return <Badge variant="outline">Cancelled</Badge>;
    } else {
      return <Badge variant="destructive">Expired</Badge>;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return <span className="text-destructive">Expired</span>;
    if (days === 0) return <span className="text-warning">Today</span>;
    if (days <= 7) return <span className="text-warning">{days} days</span>;
    return <span>{days} days</span>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Job Seeker Subscriptions</h1>
            <p className="text-muted-foreground">
              Monitor subscription revenue and manage subscribers
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.totalSubscribers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics?.activeSubscribers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.expiredSubscribers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.mrr || 0} GHS</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.churnRate || 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <RevenueChart timeRange={timeRange} />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="From date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />

              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading subscriptions...</div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No subscriptions match your criteria
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead className="text-right">Applications</TableHead>
                    <TableHead className="text-right">Total Paid</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={sub.profiles?.avatar_url} />
                            <AvatarFallback>
                              {sub.profiles?.full_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {sub.profiles?.full_name || 'Anonymous'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {sub.profiles?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status, sub.end_date)}</TableCell>
                      <TableCell>
                        {new Date(sub.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(sub.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getDaysRemaining(sub.end_date)}</TableCell>
                      <TableCell className="text-right">
                        {sub.application_count}
                      </TableCell>
                      <TableCell className="text-right">
                        {sub.lifetime_value || 0} GHS
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedSub(sub)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                extendSubscription.mutate({ id: sub.id, days: 30 })
                              }
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Extend 30 Days
                            </DropdownMenuItem>
                            {sub.status === 'active' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  cancelSubscription.mutate({
                                    id: sub.id,
                                    reason: 'Admin cancellation',
                                  })
                                }
                                className="text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Subscription
                              </DropdownMenuItem>
                            )}
                            {sub.profiles?.email && (
                              <DropdownMenuItem asChild>
                                <a href={`mailto:${sub.profiles.email}`}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Email Subscriber
                                </a>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Cohort Analysis */}
        <CohortTable />
      </main>

      <Footer />

      {/* Subscriber Detail Modal */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscriber Details</DialogTitle>
            <DialogDescription>
              View and manage subscription information
            </DialogDescription>
          </DialogHeader>

          {selectedSub && (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedSub.profiles?.avatar_url} />
                  <AvatarFallback>
                    {selectedSub.profiles?.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedSub.profiles?.full_name || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedSub.profiles?.email}
                  </p>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedSub.status, selectedSub.end_date)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Auto Renew</label>
                  <div className="mt-1">
                    {selectedSub.auto_renew ? (
                      <Badge variant="default">Enabled</Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <div className="mt-1">
                    {new Date(selectedSub.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <div className="mt-1">
                    {new Date(selectedSub.end_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Applications Submitted</label>
                  <div className="mt-1 text-2xl font-bold">
                    {selectedSub.application_count}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Lifetime Value</label>
                  <div className="mt-1 text-2xl font-bold">
                    {selectedSub.lifetime_value || 0} GHS
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  placeholder="Add internal notes about this subscriber..."
                  value={adminNote || selectedSub.admin_notes || ''}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
                <Button onClick={handleSaveNote} className="mt-2" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Save Note
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    extendSubscription.mutate({ id: selectedSub.id, days: 30 })
                  }
                  variant="outline"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Extend 30 Days
                </Button>
                {selectedSub.profiles?.email && (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${selectedSub.profiles.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email Subscriber
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscriptions;
