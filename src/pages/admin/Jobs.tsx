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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAdminJobs, useJobAnalytics, useAdminJobMutations } from '@/hooks/useAdminJobs';
import { JobsAnalyticsChart } from '@/components/admin/JobsAnalyticsChart';
import { exportJobsToCSV } from '@/lib/exportJobsCSV';
import {
  Briefcase,
  Search,
  Download,
  MoreVertical,
  Eye,
  Edit,
  XCircle,
  Calendar,
  Flag,
  Trash2,
  Users,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Jobs = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: '',
    location: '',
    businessId: '',
    dateFrom: '',
    dateTo: '',
  });

  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [flagJobId, setFlagJobId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const { data: jobs = [], isLoading } = useAdminJobs(filters);
  const { data: analytics } = useJobAnalytics();
  const { deleteJob, closeJob, extendExpiry, flagJob, unflagJob } = useAdminJobMutations();

  const handleExport = () => {
    exportJobsToCSV(jobs);
  };

  const handleDeleteConfirm = () => {
    if (deleteJobId) {
      deleteJob.mutate(deleteJobId);
      setDeleteJobId(null);
    }
  };

  const handleFlagConfirm = () => {
    if (flagJobId) {
      flagJob.mutate({ id: flagJobId, reason: flagReason });
      setFlagJobId(null);
      setFlagReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: 'default',
      draft: 'secondary',
      closed: 'outline',
      expired: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return <span className="text-destructive">Expired</span>;
    if (days === 0) return <span className="text-warning">Today</span>;
    return <span>{days} days</span>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Job Listings Management</h1>
            <p className="text-muted-foreground">Monitor and manage all jobs across the platform</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalJobs || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.activeJobs || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalApplications || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Applications/Job</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.avgApplicationsPerJob || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs or businesses..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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

        {/* Jobs Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>All Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No jobs match your criteria
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Applications</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Conv Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job: any) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {job.is_flagged && (
                            <Flag className="h-4 w-4 text-destructive" />
                          )}
                          <Link
                            to={`/jobs/${job.id}`}
                            className="font-medium hover:underline"
                          >
                            {job.title}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{job.businesses?.name}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        {job.posted_at
                          ? new Date(job.posted_at).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {job.expires_at ? getDaysRemaining(job.expires_at) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {job.application_count}
                      </TableCell>
                      <TableCell className="text-right">{job.views_count}</TableCell>
                      <TableCell className="text-right">
                        {job.conversion_rate}%
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/jobs/${job.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/job-applications/${job.id}`}>
                                <Users className="mr-2 h-4 w-4" />
                                View Applications
                              </Link>
                            </DropdownMenuItem>
                            {job.status === 'active' && (
                              <DropdownMenuItem
                                onClick={() => closeJob.mutate(job.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Close Job
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                extendExpiry.mutate({ id: job.id, days: 30 })
                              }
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Extend 30 Days
                            </DropdownMenuItem>
                            {job.is_flagged ? (
                              <DropdownMenuItem
                                onClick={() => unflagJob.mutate(job.id)}
                              >
                                <Flag className="mr-2 h-4 w-4" />
                                Unflag
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setFlagJobId(job.id)}>
                                <Flag className="mr-2 h-4 w-4" />
                                Flag Job
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setDeleteJobId(job.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
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

        {/* Analytics Charts */}
        {jobs.length > 0 && <JobsAnalyticsChart jobs={jobs} />}
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
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

      {/* Flag Job Dialog */}
      <AlertDialog open={!!flagJobId} onOpenChange={() => setFlagJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flag Job</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for flagging this job for review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Reason for flagging..."
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFlagConfirm}>
              Flag Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Jobs;
