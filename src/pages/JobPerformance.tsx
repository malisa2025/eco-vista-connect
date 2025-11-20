import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobPerformance, useRecalculatePerformance } from '@/hooks/useJobPerformance';
import { PerformanceScoreGauge, ScoreBreakdown } from '@/components/jobs/PerformanceScoreGauge';
import { TrafficChart, ViewsBySource } from '@/components/charts/TrafficChart';
import {
  Eye,
  Users,
  TrendingUp,
  Clock,
  RefreshCw,
  Edit,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const JobPerformance = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { data, isLoading } = useJobPerformance(jobId!);
  const recalculate = useRecalculatePerformance();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Loading performance data...</div>
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
          <div className="text-center text-destructive">Failed to load performance data</div>
        </main>
        <Footer />
      </div>
    );
  }

  const { job, performance, metrics, views, applications, viewsBySource, applicationsByStatus } = data;

  const getRecommendations = () => {
    const recommendations = [];

    if (performance.visibility_score < 50) {
      recommendations.push({
        type: 'warning',
        message: 'Low visibility - Consider sharing your job posting on social media or professional networks.',
      });
    }

    if (performance.engagement_score < 50 && metrics.totalViews > 50) {
      recommendations.push({
        type: 'warning',
        message: 'Good views but low applications - Consider revising job requirements or salary information.',
      });
    }

    if (performance.quality_score < 50 && metrics.totalApplications > 5) {
      recommendations.push({
        type: 'info',
        message: 'Application quality can be improved - Consider requiring video submissions or more detailed cover letters.',
      });
    }

    if (performance.overall_score >= 80) {
      recommendations.push({
        type: 'success',
        message: 'Excellent performance! Your job posting is attracting quality applicants.',
      });
    }

    if (metrics.totalApplications === 0 && metrics.totalViews > 20) {
      recommendations.push({
        type: 'warning',
        message: 'High views but no applications - Check if requirements are too strict or salary is not mentioned.',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();
  const daysActive = job.posted_at
    ? Math.floor((new Date().getTime() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <Badge>{job.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              Posted {daysActive} days ago • {job.businesses?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => recalculate.mutate(jobId!)}
              disabled={recalculate.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${recalculate.isPending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/jobs/${jobId}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Page
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={`/post-job?edit=${jobId}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Link>
            </Button>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6 space-y-2">
            {recommendations.map((rec, index) => (
              <Alert key={index} variant={rec.type === 'warning' ? 'destructive' : 'default'}>
                {rec.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : rec.type === 'info' ? (
                  <Lightbulb className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{rec.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Performance Score */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <PerformanceScoreGauge
            score={performance.overall_score}
            subtitle="Based on visibility, engagement, conversion, and quality"
          />
          <ScoreBreakdown
            visibility={performance.visibility_score}
            engagement={performance.engagement_score}
            conversion={performance.conversion_score}
            quality={performance.quality_score}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.viewsLast7Days} in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.applicationsLast7Days} in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Views to applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgQualityScore}</div>
              <p className="text-xs text-muted-foreground">
                Out of 100
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="traffic" className="mb-6">
          <TabsList>
            <TabsTrigger value="traffic">Traffic & Engagement</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="applicants">Applicant Status</TabsTrigger>
          </TabsList>

          <TabsContent value="traffic" className="space-y-4">
            <TrafficChart views={views} applications={applications} />
            
            {metrics.timeToFirstApplication && (
              <Card>
                <CardHeader>
                  <CardTitle>Time Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">
                        {metrics.timeToFirstApplication} hours
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Time to first application
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sources">
            <ViewsBySource viewsBySource={viewsBySource || {}} />
          </TabsContent>

          <TabsContent value="applicants">
            <Card>
              <CardHeader>
                <CardTitle>Applications by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries(applicationsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-4 border rounded">
                      <span className="font-medium capitalize">{status}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to={`/job-applications/${jobId}`}>
                  <Users className="mr-2 h-4 w-4" />
                  View All Applications
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/jobs/${jobId}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View as Job Seeker
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default JobPerformance;
