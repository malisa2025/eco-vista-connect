import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessDashboard } from "@/hooks/useBusinessDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Eye,
  Users,
  Briefcase,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Edit,
  Megaphone,
  MessageSquare,
  Settings,
  BarChart3,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BusinessDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { business, stats, recentLeads, recentReviews, viewsTrend, isLoading } = useBusinessDashboard(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Business not found</h2>
            <Button onClick={() => navigate("/my-businesses")}>
              Back to My Businesses
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const quickActions = [
    {
      title: "Edit Profile",
      description: "Update business info",
      icon: Edit,
      href: `/businesses/${id}/edit`,
      color: "text-blue-500",
    },
    {
      title: "Post a Job",
      description: "Create new listing",
      icon: Briefcase,
      href: `/post-job?business=${id}`,
      color: "text-green-500",
    },
    {
      title: "Run Ads",
      description: "Promote your business",
      icon: Megaphone,
      href: `/purchase-ad?business=${id}`,
      color: "text-orange-500",
    },
    {
      title: "View Leads",
      description: "Manage inquiries",
      icon: Users,
      href: `/leads/${id}`,
      color: "text-purple-500",
    },
    {
      title: "Analytics",
      description: "View detailed stats",
      icon: BarChart3,
      href: `/businesses/${id}/analytics`,
      color: "text-cyan-500",
    },
    {
      title: "View Page",
      description: "See public profile",
      icon: Eye,
      href: `/businesses/${id}`,
      color: "text-pink-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-background border flex items-center justify-center overflow-hidden">
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{business.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{business.category}</Badge>
                  <Badge variant="outline">{business.region}</Badge>
                  {business.is_verified && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/businesses/${id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
              <Button onClick={() => navigate(`/businesses/${id}/edit`)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.viewsThisMonth || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {(stats?.viewsGrowth || 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  <span className={stats?.viewsGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                    {stats?.viewsGrowth || 0}%
                  </span>
                  <span className="ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-primary font-medium">{stats?.leadsThisMonth || 0}</span>
                  <span className="ml-1">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
                <div className="text-xs text-muted-foreground">
                  {stats?.totalApplications || 0} total applications
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.avgRating ? stats.avgRating.toFixed(1) : "0.0"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats?.totalReviews || 0} reviews
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to manage your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto flex-col py-4 px-3 gap-2"
                    onClick={() => navigate(action.href)}
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Views Trend */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Views Trend</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/businesses/${id}/analytics`)}>
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={viewsTrend || []}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Profile Completeness */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Completeness</CardTitle>
                <CardDescription>Complete your profile to attract more customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const checks = [
                    { label: "Business logo", complete: !!business.logo_url },
                    { label: "Cover image", complete: !!business.image_url },
                    { label: "Description", complete: !!business.description },
                    { label: "Phone number", complete: !!business.phone },
                    { label: "Email address", complete: !!business.email },
                    { label: "Website", complete: !!business.website },
                    { label: "Business hours", complete: !!business.business_hours },
                    { label: "Gallery images", complete: (business.gallery_images?.length || 0) > 0 },
                    { label: "Video", complete: !!business.video_url },
                    { label: "Verification", complete: !!business.is_verified },
                  ];
                  const completed = checks.filter(c => c.complete).length;
                  const percentage = Math.round((completed / checks.length) * 100);

                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold">{percentage}%</span>
                        <span className="text-sm text-muted-foreground">
                          {completed}/{checks.length} completed
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2 mb-4" />
                      <div className="grid grid-cols-2 gap-2">
                        {checks.slice(0, 6).map((check) => (
                          <div
                            key={check.label}
                            className={`flex items-center gap-2 text-sm ${
                              check.complete ? "text-green-600" : "text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className={`h-4 w-4 ${
                              check.complete ? "text-green-500" : "text-muted-foreground/40"
                            }`} />
                            {check.label}
                          </div>
                        ))}
                      </div>
                      {percentage < 100 && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => navigate(`/businesses/${id}/edit`)}
                        >
                          Complete Profile
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Leads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Latest inquiries from customers</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/leads/${id}`)}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {!recentLeads || recentLeads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No leads yet</p>
                    <p className="text-sm">Leads from your profile will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate(`/leads/${id}`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{lead.name}</p>
                            <Badge variant={lead.status === "new" ? "default" : "secondary"} className="text-xs">
                              {lead.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Reviews</CardTitle>
                  <CardDescription>What customers are saying</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/businesses/${id}#reviews`)}>
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {!recentReviews || recentReviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No reviews yet</p>
                    <p className="text-sm">Customer reviews will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.comment || "No comment provided"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns */}
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Your running advertisements and promotions</CardDescription>
              </div>
              <Button onClick={() => navigate(`/purchase-ad?business=${id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </CardHeader>
            <CardContent>
              {(stats?.activeAds || 0) === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No active campaigns</p>
                  <p className="text-sm mb-4">Start promoting your business to reach more customers</p>
                  <Button variant="outline" onClick={() => navigate(`/purchase-ad?business=${id}`)}>
                    Create Your First Ad
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{stats?.activeAds} Active Ad{stats?.activeAds !== 1 ? 's' : ''}</p>
                      <p className="text-sm text-muted-foreground">Currently running</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/my-businesses")}>
                    Manage Ads
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
