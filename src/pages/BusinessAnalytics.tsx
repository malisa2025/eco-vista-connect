import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusinessAnalytics } from '@/hooks/useBusinessAnalytics';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const BusinessAnalytics = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { data, isLoading } = useBusinessAnalytics(businessId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Loading analytics...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center text-destructive">Failed to load analytics</div>
        </main>
        <Footer />
      </div>
    );
  }

  const { overview, trends, jobsByCategory } = data;

  // Prepare trend data for chart
  const trendData = data.jobs
    .filter((j: any) => j.posted_at)
    .sort((a: any, b: any) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime())
    .reduce((acc: any[], job: any) => {
      const month = new Date(job.posted_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      
      const existing = acc.find((item) => item.month === month);
      if (existing) {
        existing.jobs++;
      } else {
        acc.push({ month, jobs: 1, applications: 0 });
      }
      
      return acc;
    }, []);

  // Add application counts to trend data
  data.applications.forEach((app: any) => {
    const month = new Date(app.applied_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
    
    const existing = trendData.find((item: any) => item.month === month);
    if (existing) {
      existing.applications++;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Business Hiring Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of your hiring performance
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {overview.activeJobs} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {trends.recentApplications} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hired</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.hired}</div>
              <p className="text-xs text-muted-foreground">
                Total hires
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time to Hire</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.avgTimeToHire}</div>
              <p className="text-xs text-muted-foreground">
                Days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost per Hire</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.costPerHire}</div>
              <p className="text-xs text-muted-foreground">
                GHS
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trends.applicationTrend}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hiring Trends Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Hiring Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Jobs Posted"
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Jobs Posted</TableHead>
                  <TableHead className="text-right">Applications</TableHead>
                  <TableHead className="text-right">Hired</TableHead>
                  <TableHead className="text-right">Avg App/Job</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(jobsByCategory).map(([category, stats]: [string, any]) => (
                  <TableRow key={category}>
                    <TableCell className="font-medium">{category}</TableCell>
                    <TableCell className="text-right">{stats.count}</TableCell>
                    <TableCell className="text-right">{stats.applications}</TableCell>
                    <TableCell className="text-right">{stats.hired}</TableCell>
                    <TableCell className="text-right">
                      {(stats.applications / stats.count).toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessAnalytics;
