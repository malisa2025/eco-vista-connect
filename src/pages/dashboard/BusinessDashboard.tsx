import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessDashboard } from "@/hooks/useBusinessDashboard";
import { useBusinessUpdate } from "@/hooks/useBusinessUpdate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/business/ImageUploader";
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
  Settings,
  BarChart3,
  Plus,
  CheckCircle2,
  Clock,
  Mail,
  Building2,
  UtensilsCrossed,
  Bed,
  Package,
  Calendar,
  Wrench,
  Stethoscope,
  Camera,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BusinessDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { business, stats, recentLeads, recentReviews, viewsTrend, isLoading } = useBusinessDashboard(id);
  const updateBusiness = useBusinessUpdate(id || '');
  const [showLogoUpload, setShowLogoUpload] = useState(false);

  const handleLogoUpload = (url: string) => {
    if (url) {
      updateBusiness.mutate({ logo_url: url });
      setShowLogoUpload(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-dashboard bg-dashboard-animated">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64 bg-white/5" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 bg-white/5" />
              ))}
            </div>
            <Skeleton className="h-64 w-full bg-white/5" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col bg-dashboard bg-dashboard-animated">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">Business not found</h2>
            <Button onClick={() => navigate("/my-businesses")} className="bg-gradient-to-r from-cyan-500 to-blue-500">
              Back to My Businesses
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Base quick actions for all business types
  const baseActions = [
    {
      title: "Edit Profile",
      description: "Update business info",
      icon: Edit,
      href: `/businesses/${id}/edit`,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Post a Job",
      description: "Create new listing",
      icon: Briefcase,
      href: `/post-job?business=${id}`,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Run Ads",
      description: "Promote your business",
      icon: Megaphone,
      href: `/purchase-ad?business=${id}`,
      gradient: "from-orange-500 to-amber-500",
    },
    {
      title: "View Leads",
      description: "Manage inquiries",
      icon: Users,
      href: `/leads/${id}`,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Analytics",
      description: "View detailed stats",
      icon: BarChart3,
      href: `/businesses/${id}/analytics`,
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      title: "View Page",
      description: "See public profile",
      icon: Eye,
      href: `/businesses/${id}`,
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  // Type-specific actions
  const getTypeSpecificActions = () => {
    switch (business.business_type) {
      case 'restaurant':
        return [
          {
            title: "Manage Menu",
            description: "Add/edit items",
            icon: UtensilsCrossed,
            href: `/dashboard/menu/${id}`,
            gradient: "from-orange-500 to-red-500",
          },
          {
            title: "Reservations",
            description: "View bookings",
            icon: Calendar,
            href: `/dashboard/reservations/${id}`,
            gradient: "from-teal-500 to-cyan-500",
          },
        ];
      case 'hotel':
        return [
          {
            title: "Manage Rooms",
            description: "Room types & pricing",
            icon: Bed,
            href: `/dashboard/hotel/rooms`,
            gradient: "from-indigo-500 to-purple-500",
          },
          {
            title: "Bookings",
            description: "View reservations",
            icon: Calendar,
            href: `/dashboard/hotel/bookings`,
            gradient: "from-teal-500 to-green-500",
          },
        ];
      case 'retail':
        return [
          {
            title: "Products",
            description: "Manage catalog",
            icon: Package,
            href: `/dashboard/products/${id}`,
            gradient: "from-amber-500 to-yellow-500",
          },
        ];
      case 'services':
        return [
          {
            title: "Services",
            description: "Manage offerings",
            icon: Wrench,
            href: `/businesses/${id}/edit`,
            gradient: "from-slate-500 to-gray-500",
          },
        ];
      case 'healthcare':
        return [
          {
            title: "Services",
            description: "Medical services",
            icon: Stethoscope,
            href: `/businesses/${id}/edit`,
            gradient: "from-red-500 to-pink-500",
          },
        ];
      default:
        return [];
    }
  };

  const quickActions = [...getTypeSpecificActions(), ...baseActions];

  const statCards = [
    {
      title: "Profile Views",
      value: stats?.viewsThisMonth || 0,
      icon: Eye,
      gradient: "from-purple-500 to-pink-500",
      subtext: `${stats?.viewsGrowth || 0}% vs last month`,
      trend: (stats?.viewsGrowth || 0) >= 0 ? 'up' : 'down',
    },
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: Users,
      gradient: "from-cyan-500 to-blue-500",
      subtext: `${stats?.leadsThisMonth || 0} this month`,
    },
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      gradient: "from-green-500 to-emerald-500",
      subtext: `${stats?.totalApplications || 0} total applications`,
    },
    {
      title: "Rating",
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : "0.0",
      icon: Star,
      gradient: "from-yellow-500 to-orange-500",
      subtext: `${stats?.totalReviews || 0} reviews`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-dashboard bg-dashboard-animated">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Logo with upload capability */}
                <Dialog open={showLogoUpload} onOpenChange={setShowLogoUpload}>
                  <DialogTrigger asChild>
                    <button className="relative w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-cyan-400/50 transition-colors">
                      {business.logo_url ? (
                        <img
                          src={business.logo_url}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-white/60" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Business Logo</DialogTitle>
                    </DialogHeader>
                    <ImageUploader
                      label="Business Logo"
                      aspectRatio="square"
                      currentImageUrl={business.logo_url || undefined}
                      onUploadComplete={handleLogoUpload}
                      maxSizeMB={2}
                    />
                  </DialogContent>
                </Dialog>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{business.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="bg-white/10 text-white/80 border-white/20">{business.category}</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/70">{business.region}</Badge>
                    {business.is_verified && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {/* Business Description */}
                  {business.description ? (
                    <p className="text-white/70 text-sm mt-3 line-clamp-2 max-w-xl">
                      {business.description}
                    </p>
                  ) : (
                    <p className="text-white/40 text-sm mt-3 italic">
                      No description yet.{' '}
                      <Link to={`/businesses/${id}/edit`} className="text-cyan-400 hover:underline">
                        Add one
                      </Link>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/businesses/${id}`)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Page
                </Button>
                <Button 
                  onClick={() => navigate(`/businesses/${id}/edit`)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map((stat, index) => (
              <div
                key={stat.title}
                className="glass-card rounded-xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
              >
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                >
                  <div className={`h-full bg-gradient-to-r ${stat.gradient}`} />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white/60">{stat.title}</span>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="flex items-center text-xs text-white/50 mt-1">
                  {stat.trend && (
                    stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-400" />
                    )
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : ''}>
                    {stat.subtext}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.slice(0, 6).map((action) => (
                <button
                  key={action.title}
                  onClick={() => navigate(action.href)}
                  className="glass-card rounded-xl p-4 flex flex-col items-center gap-3 group hover:scale-105 transition-all duration-300 border border-white/10 hover:border-white/30"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm text-white">{action.title}</div>
                    <div className="text-xs text-white/50 hidden sm:block">
                      {action.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Views Trend */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Views Trend</h3>
                  <p className="text-sm text-white/50">Last 7 days</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/businesses/${id}/analytics`)}
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewsTrend || []}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15,15,30,0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="url(#gradient)"
                      strokeWidth={3}
                      dot={false}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profile Completeness */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Profile Completeness</h3>
              <p className="text-sm text-white/50 mb-4">Complete your profile to attract more customers</p>
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
                      <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        {percentage}%
                      </span>
                      <span className="text-sm text-white/50">
                        {completed}/{checks.length} completed
                      </span>
                    </div>
                    <div className="relative h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
                      <div 
                        className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {checks.slice(0, 6).map((check) => (
                        <div
                          key={check.label}
                          className={`flex items-center gap-2 text-sm ${
                            check.complete ? "text-green-400" : "text-white/40"
                          }`}
                        >
                          <CheckCircle2 className={`h-4 w-4 ${
                            check.complete ? "text-green-400" : "text-white/20"
                          }`} />
                          {check.label}
                        </div>
                      ))}
                    </div>
                    {percentage < 100 && (
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                        onClick={() => navigate(`/businesses/${id}/edit`)}
                      >
                        Complete Profile
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Leads */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Leads</h3>
                  <p className="text-sm text-white/50">Latest inquiries from customers</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/leads/${id}`)}
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              {!recentLeads || recentLeads.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No leads yet</p>
                  <p className="text-sm">Leads from your profile will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 hover:border-white/10"
                      onClick={() => navigate(`/leads/${id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {lead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white truncate">{lead.name}</p>
                          <Badge className={`text-xs ${lead.status === "new" ? "bg-cyan-500/20 text-cyan-400" : "bg-white/10 text-white/60"}`}>
                            {lead.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Reviews</h3>
                  <p className="text-sm text-white/50">What customers are saying</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/businesses/${id}#reviews`)}
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              {!recentReviews || recentReviews.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No reviews yet</p>
                  <p className="text-sm">Customer reviews will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-white/40 ml-2">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 line-clamp-2">
                        {review.comment || "No comment provided"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="glass-card rounded-2xl p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Active Campaigns</h3>
                <p className="text-sm text-white/50">Your running advertisements and promotions</p>
              </div>
              <Button 
                onClick={() => navigate(`/purchase-ad?business=${id}`)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
            {(stats?.activeAds || 0) === 0 ? (
              <div className="text-center py-8 text-white/50">
                <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No active campaigns</p>
                <p className="text-sm mb-4">Start promoting your business to reach more customers</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/purchase-ad?business=${id}`)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Create Your First Ad
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Megaphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{stats?.activeAds} Active Ad{stats?.activeAds !== 1 ? 's' : ''}</p>
                    <p className="text-sm text-white/50">Currently running</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/my-businesses")}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Manage Ads
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}