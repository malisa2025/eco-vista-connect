import { useParams, useNavigate } from 'react-router-dom';
import { useAdDailyStats, useAdPerformanceSummary } from '@/hooks/useAdAnalytics';
import { ImpressionChart } from '@/components/charts/ImpressionChart';
import { CTRChart } from '@/components/charts/CTRChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ABTestManager } from '@/components/ads/ABTestManager';
import { CompetitorBenchmarks } from '@/components/ads/CompetitorBenchmarks';
import { ROICalculator } from '@/components/ads/ROICalculator';
import { ConversionTracker } from '@/components/ads/ConversionTracker';
import { SmartRecommendations } from '@/components/ads/SmartRecommendations';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ArrowLeft, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  DollarSign, 
  Users,
  Download,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { analyzeAdPerformance, calculateCostPerClick, estimateReach } from '@/lib/adInsights';
import { exportDailyStats } from '@/lib/exportCSV';

export default function AdAnalytics() {
  const { adId } = useParams();
  const navigate = useNavigate();
  
  const { data: dailyStats, isLoading: statsLoading } = useAdDailyStats(adId || '', 30);
  const { data: summary, isLoading: summaryLoading } = useAdPerformanceSummary(adId || '');

  if (statsLoading || summaryLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">Loading analytics...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!summary) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Advertisement not found</p>
              <Button className="mt-4" onClick={() => navigate('/my-businesses')}>
                Back to My Businesses
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const insights = analyzeAdPerformance({
    impressions: summary.totalImpressions,
    clicks: summary.totalClicks,
    ctr: summary.ctr,
    daysActive: summary.daysActive,
    status: summary.ad.status,
  });

  const chartData = dailyStats?.map(stat => ({
    date: stat.date,
    impressions: stat.impressions,
    clicks: stat.clicks,
  })) || [];

  const ctrChartData = dailyStats?.map(stat => ({
    date: stat.date,
    ctr: stat.ctr,
  })) || [];

  const handleExport = () => {
    if (dailyStats) {
      exportDailyStats(dailyStats, summary.ad.title);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'danger':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getInsightVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'danger':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/my-businesses')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Businesses
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{summary.ad.title}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">{summary.ad.businesses.name}</p>
                  <Badge variant={summary.ad.status === 'active' ? 'default' : 'secondary'}>
                    {summary.ad.status}
                  </Badge>
                </div>
              </div>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Impressions</p>
                    <p className="text-2xl font-bold">{summary.totalImpressions.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <MousePointerClick className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clicks</p>
                    <p className="text-2xl font-bold">{summary.totalClicks.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CTR</p>
                    <p className="text-2xl font-bold">{summary.ctr.toFixed(2)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <DollarSign className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost/Click</p>
                    <p className="text-2xl font-bold">{calculateCostPerClick(summary.ad.total_cost, summary.totalClicks)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Reach</p>
                    <p className="text-2xl font-bold">{estimateReach(summary.totalImpressions)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          {insights.length > 0 && (
            <div className="mb-8 space-y-4">
              <h2 className="text-xl font-bold">Performance Insights</h2>
              {insights.map((insight, index) => (
                <Alert key={index} variant={getInsightVariant(insight.type)}>
                  {getInsightIcon(insight.type)}
                  <AlertTitle>{insight.title}</AlertTitle>
                  <AlertDescription>
                    {insight.message}
                    {insight.recommendation && (
                      <p className="mt-2 font-medium">💡 {insight.recommendation}</p>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Tabs for Different Views */}
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
              <TabsTrigger value="roi">ROI</TabsTrigger>
              <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
              <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImpressionChart data={chartData} />
                <CTRChart data={ctrChartData} />
              </div>
              <ConversionTracker advertisementId={adId || ''} />
            </TabsContent>

            <TabsContent value="ab-tests">
              <ABTestManager advertisementId={adId || ''} />
            </TabsContent>

            <TabsContent value="roi">
              <ROICalculator advertisementId={adId || ''} totalSpend={summary.ad.total_cost} />
            </TabsContent>

            <TabsContent value="benchmarks">
              <CompetitorBenchmarks
                category={summary.ad.businesses.category}
                region={summary.ad.businesses.region}
                currentCTR={summary.ctr}
                currentCPC={parseFloat(calculateCostPerClick(summary.ad.total_cost, summary.totalClicks).replace('GH₵', ''))}
                currentConversionRate={0}
              />
            </TabsContent>

            <TabsContent value="recommendations">
              <SmartRecommendations advertisementId={adId || ''} />
            </TabsContent>
          </Tabs>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ad Spot</p>
                  <p className="font-medium">{summary.ad.ad_spots.name}</p>
                  <p className="text-xs text-muted-foreground">{summary.ad.ad_spots.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Campaign Period</p>
                  <p className="font-medium">
                    {new Date(summary.ad.start_date).toLocaleDateString()} - {new Date(summary.ad.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {summary.daysRemaining > 0 ? `${summary.daysRemaining} days remaining` : 'Expired'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                  <p className="font-medium">GH₵{summary.ad.total_cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                  <p className="font-medium">{summary.daysActive} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
