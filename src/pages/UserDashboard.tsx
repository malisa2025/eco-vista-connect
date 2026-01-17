import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDashboard } from "@/hooks/useUserDashboard";
import { useBusinessOwners } from "@/hooks/useBusinessClaims";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UtensilsCrossed, 
  Hotel, 
  Briefcase, 
  Heart, 
  Calendar, 
  MapPin,
  Building2,
  ArrowRight,
  Clock,
  User,
  Store,
  Bed,
  Wrench,
  Stethoscope,
  Package,
} from "lucide-react";
import { format } from "date-fns";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { profile, user, roles } = useAuth();

  // Get user type label based on roles
  const getUserTypeLabel = () => {
    if (roles?.includes('admin')) return 'Administrator';
    if (roles?.includes('moderator')) return 'Moderator';
    if (roles?.includes('business_owner')) return 'Business Owner';
    return 'General User';
  };

  const getUserTypeGradient = () => {
    if (roles?.includes('admin')) return 'from-red-500 to-orange-500';
    if (roles?.includes('moderator')) return 'from-green-500 to-emerald-500';
    if (roles?.includes('business_owner')) return 'from-purple-500 to-pink-500';
    return '';
  };

  const isAdmin = roles?.includes('admin');
  const isModerator = roles?.includes('moderator');
  const isBusinessOwnerRole = roles?.includes('business_owner');

  const { 
    stats, 
    recentReservations, 
    recentBookings, 
    recentApplications, 
    savedJobs,
    isLoading 
  } = useUserDashboard();
  const { data: ownerships } = useBusinessOwners(user?.id);

  // Get user's business info if they own any (registered businesses)
  const userBusinesses = ownerships?.filter((o: any) => o.businesses).map((o: any) => o.businesses) || [];
  const hasRegisteredBusiness = userBusinesses.length > 0;
  const primaryBusiness = userBusinesses[0];

  // Get business type from user metadata (set during signup)
  const userBusinessType = user?.user_metadata?.business_type;

  // Get business type icon and label
  const getBusinessTypeInfo = (type: string) => {
    switch (type) {
      case 'restaurant':
        return { icon: UtensilsCrossed, label: 'Restaurant', gradient: 'from-orange-500 to-red-500' };
      case 'hotel':
        return { icon: Bed, label: 'Hotel', gradient: 'from-indigo-500 to-purple-500' };
      case 'retail':
        return { icon: Package, label: 'Retail', gradient: 'from-amber-500 to-yellow-500' };
      case 'services':
        return { icon: Wrench, label: 'Services', gradient: 'from-slate-500 to-gray-500' };
      case 'healthcare':
        return { icon: Stethoscope, label: 'Healthcare', gradient: 'from-red-500 to-pink-500' };
      default:
        return { icon: Store, label: 'Business', gradient: 'from-purple-500 to-pink-500' };
    }
  };

  // Use registered business type, or fallback to user metadata business type
  const activeBusinessType = primaryBusiness?.business_type || userBusinessType;
  const businessTypeInfo = activeBusinessType ? getBusinessTypeInfo(activeBusinessType) : null;
  const BusinessIcon = businessTypeInfo?.icon || Store;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      completed: "outline",
      rejected: "destructive",
      interview: "default",
      offered: "default",
    };
    return <Badge variant={variants[status] || "secondary"} className="bg-opacity-20">{status}</Badge>;
  };

  // Show business actions if user has business_owner role (even if no business registered yet)
  const quickActions = (isBusinessOwnerRole || hasRegisteredBusiness) ? [
    { icon: "🏢", title: hasRegisteredBusiness ? "My Businesses" : "Register Business", path: hasRegisteredBusiness ? "/my-businesses" : "/register-business" },
    ...(hasRegisteredBusiness ? [{ icon: "📊", title: "Dashboard", path: `/dashboard/business/${primaryBusiness?.id}` }] : []),
    ...(hasRegisteredBusiness ? [{ icon: "💼", title: "Post Job", path: `/post-job?business=${primaryBusiness?.id}` }] : []),
    ...(hasRegisteredBusiness ? [{ icon: "📢", title: "Run Ads", path: `/purchase-ad?business=${primaryBusiness?.id}` }] : []),
    ...(!hasRegisteredBusiness ? [{ icon: "📰", title: "Business News", path: "/business-news" }] : []),
    ...(!hasRegisteredBusiness ? [{ icon: "💼", title: "Browse Jobs", path: "/jobs" }] : []),
  ] : [
    { icon: "🏢", title: "Browse Businesses", path: "/businesses" },
    { icon: "💼", title: "Find Jobs", path: "/jobs" },
    { icon: "🏨", title: "Book Hotels", path: "/hotels" },
    { icon: "❤️", title: "My Profile", path: "/profile" },
  ];

  const statCards = [
    { title: "Upcoming Dinners", value: stats.upcomingReservations, icon: "🍽️", path: "/my-reservations", gradient: "gradient-purple-bg" },
    { title: "Hotel Bookings", value: stats.upcomingBookings, icon: "🏨", path: "/my-bookings", gradient: "gradient-pink-bg" },
    { title: "Saved Jobs", value: stats.savedJobs, icon: "💼", path: "/saved-jobs", gradient: "gradient-blue-bg" },
    { title: "Favorite Places", value: stats.favoriteBusinesses, icon: "❤️", path: "/favorites", gradient: "gradient-warm-bg" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-dashboard bg-dashboard-animated font-dm-sans">
      <Navbar />
      
      <main className="flex-1 relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Welcome Section */}
          <div className="glass-card p-8 mb-6 relative overflow-hidden animate-fade-in">
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(circle,hsl(245_58%_66%_/_0.2)_0%,transparent_70%)] rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <h1 className="font-serif-display text-4xl font-normal mb-1 text-gradient relative z-10">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
            </h1>
            <div className="flex items-center gap-3 flex-wrap relative z-10">
              <p className="text-[hsl(240_10%_73%)] text-sm">
                Here's what's happening with your account
              </p>
              {/* User Role Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide border ${
                isAdmin 
                  ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/40 text-red-400'
                  : isModerator
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40 text-green-400'
                  : 'bg-[linear-gradient(135deg,hsl(190_100%_50%_/_0.2),hsl(245_58%_66%_/_0.2))] border-[hsl(190_100%_50%_/_0.4)] text-[hsl(190_100%_50%)]'
              }`}>
                <User className="h-3.5 w-3.5" />
                {getUserTypeLabel()}
              </span>
              
              {/* Business Type Badge (if business owner role or has registered business) */}
              {(isBusinessOwnerRole || hasRegisteredBusiness) && businessTypeInfo && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide bg-gradient-to-r ${businessTypeInfo.gradient} bg-opacity-20 border border-white/20 text-white`}>
                  <BusinessIcon className="h-3.5 w-3.5" />
                  {businessTypeInfo.label}
                </span>
              )}
            </div>
            
            {/* Business info for business owners with registered business */}
            {hasRegisteredBusiness && userBusinesses.length > 0 && (
              <div className="mt-4 relative z-10">
                <p className="text-white/60 text-xs mb-2 font-medium">
                  Your Businesses ({userBusinesses.length})
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {userBusinesses.map((business: any) => (
                    <div 
                      key={business.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-300 min-w-[220px] flex-shrink-0 group"
                      onClick={() => navigate(`/dashboard/business/${business.id}`)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {business.logo_url ? (
                          <img src={business.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="h-5 w-5 text-white/60" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{business.name}</p>
                        <p className="text-white/50 text-xs truncate">{business.category} • {business.region}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <div
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="glass-card p-6 text-center cursor-pointer group transition-all duration-400 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_16px_48px_hsl(18_100%_57%_/_0.3)] hover:border-transparent relative overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.15] transition-opacity duration-400 rounded-2xl ${
                    index === 0 ? 'bg-[linear-gradient(135deg,hsl(231_65%_63%),hsl(270_53%_56%))]' :
                    index === 1 ? 'bg-[linear-gradient(135deg,hsl(296_89%_78%),hsl(351_91%_63%))]' :
                    index === 2 ? 'bg-[linear-gradient(135deg,hsl(209_98%_65%),hsl(181_100%_50%))]' :
                    'bg-[linear-gradient(135deg,hsl(342_92%_73%),hsl(48_98%_63%))]'
                  }`} />
                  
                  <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-[hsl(0_0%_100%_/_0.1)] border border-[hsl(0_0%_100%_/_0.2)] flex items-center justify-center text-3xl transition-all duration-400 group-hover:scale-115 group-hover:rotate-[10deg] group-hover:shadow-[0_8px_25px_hsl(0_0%_0%_/_0.3)] group-hover:bg-[hsl(0_0%_100%_/_0.2)] relative z-10">
                    {action.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white relative z-10 transition-transform duration-300 group-hover:scale-105">
                    {action.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {statCards.map((stat) => (
              <div
                key={stat.title}
                onClick={() => navigate(stat.path)}
                className="glass-card p-6 cursor-pointer transition-all duration-400 hover:shadow-[0_8px_32px_hsl(245_58%_66%_/_0.2)] hover:border-[hsl(245_58%_66%_/_0.5)] hover:-translate-y-1 relative overflow-hidden group"
              >
                {/* Animated bottom border */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-secondary to-[hsl(190_100%_50%)] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-medium text-[hsl(240_10%_73%)] uppercase tracking-wide mb-2">
                      {stat.title}
                    </h4>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12 bg-[hsl(0_0%_100%_/_0.1)]" />
                    ) : (
                      <p className="text-4xl font-bold text-gradient">
                        {stat.value}
                      </p>
                    )}
                  </div>
                  <div className={`w-13 h-13 rounded-xl flex items-center justify-center text-2xl ${stat.gradient} border border-[hsl(0_0%_100%_/_0.1)] transition-all duration-400 group-hover:scale-110 group-hover:-rotate-[5deg] group-hover:shadow-[0_8px_20px_hsl(0_0%_0%_/_0.3)]`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Upcoming Reservations */}
            <ContentCard
              icon="🍽️"
              title="Upcoming Reservations"
              onViewAll={() => navigate('/my-reservations')}
              isEmpty={recentReservations.length === 0}
              isLoading={isLoading}
              emptyIcon="🍽️"
              emptyText="No upcoming reservations"
              emptyAction={{ label: "Browse restaurants", path: "/businesses" }}
              navigate={navigate}
            >
              {recentReservations.map((reservation) => (
                <ListItem
                  key={reservation.id}
                  icon={<UtensilsCrossed className="h-5 w-5 text-primary" />}
                  title={reservation.business?.name || 'Restaurant'}
                  subtitle={
                    <div className="flex items-center gap-2 text-sm text-[hsl(240_10%_73%)]">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(reservation.reservation_date), 'MMM d')}
                      <Clock className="h-3 w-3 ml-1" />
                      {reservation.reservation_time}
                    </div>
                  }
                  badge={getStatusBadge(reservation.status)}
                  onClick={() => navigate('/my-reservations')}
                />
              ))}
            </ContentCard>

            {/* Recent Applications */}
            <ContentCard
              icon="💼"
              title="Recent Applications"
              onViewAll={() => navigate('/my-applications')}
              isEmpty={recentApplications.length === 0}
              isLoading={isLoading}
              emptyIcon="💼"
              emptyText="No job applications yet"
              emptyAction={{ label: "Browse jobs", path: "/jobs" }}
              navigate={navigate}
            >
              {recentApplications.map((application) => (
                <ListItem
                  key={application.id}
                  icon={<Briefcase className="h-5 w-5 text-primary" />}
                  title={application.job?.title || 'Job'}
                  subtitle={
                    <p className="text-sm text-[hsl(240_10%_73%)]">
                      {application.job?.business?.name}
                    </p>
                  }
                  badge={getStatusBadge(application.status)}
                  onClick={() => navigate('/my-applications')}
                />
              ))}
            </ContentCard>

            {/* Upcoming Hotel Stays */}
            <ContentCard
              icon="🏨"
              title="Upcoming Hotel Stays"
              onViewAll={() => navigate('/my-bookings')}
              isEmpty={recentBookings.length === 0}
              isLoading={isLoading}
              emptyIcon="🏨"
              emptyText="No upcoming hotel stays"
              emptyAction={{ label: "Browse hotels", path: "/hotels" }}
              navigate={navigate}
            >
              {recentBookings.map((booking) => (
                <ListItem
                  key={booking.id}
                  icon={<Hotel className="h-5 w-5 text-primary" />}
                  title={booking.hotel?.business?.name || 'Hotel'}
                  subtitle={
                    <div className="flex items-center gap-2 text-sm text-[hsl(240_10%_73%)]">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(booking.check_in_date), 'MMM d')} - {format(new Date(booking.check_out_date), 'MMM d')}
                    </div>
                  }
                  badge={getStatusBadge(booking.status)}
                  onClick={() => navigate('/my-bookings')}
                />
              ))}
            </ContentCard>

            {/* Saved Jobs */}
            <ContentCard
              icon="💼"
              title="Saved Jobs"
              onViewAll={() => navigate('/saved-jobs')}
              isEmpty={savedJobs.length === 0}
              isLoading={isLoading}
              emptyIcon="💼"
              emptyText="No saved jobs"
              emptyAction={{ label: "Browse jobs", path: "/jobs" }}
              navigate={navigate}
            >
              {savedJobs.map((saved) => (
                <ListItem
                  key={saved.id}
                  icon={<Briefcase className="h-5 w-5 text-primary" />}
                  title={saved.job?.title || 'Job'}
                  subtitle={
                    <div className="flex items-center gap-2 text-sm text-[hsl(240_10%_73%)]">
                      <Building2 className="h-3 w-3" />
                      {saved.job?.business?.name}
                      {saved.job?.location && (
                        <>
                          <MapPin className="h-3 w-3 ml-1" />
                          {saved.job.location}
                        </>
                      )}
                    </div>
                  }
                  onClick={() => navigate(`/jobs/${saved.job?.id}`)}
                />
              ))}
            </ContentCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Content Card Component
interface ContentCardProps {
  icon: string;
  title: string;
  onViewAll: () => void;
  isEmpty: boolean;
  isLoading: boolean;
  emptyIcon: string;
  emptyText: string;
  emptyAction: { label: string; path: string };
  navigate: (path: string) => void;
  children: React.ReactNode;
}

const ContentCard = ({
  icon,
  title,
  onViewAll,
  isEmpty,
  isLoading,
  emptyIcon,
  emptyText,
  emptyAction,
  navigate,
  children,
}: ContentCardProps) => (
  <div className="glass-card p-7 transition-all duration-400 hover:shadow-[0_8px_32px_hsl(245_58%_66%_/_0.2)] hover:-translate-y-1 hover:border-[hsl(245_58%_66%_/_0.3)] relative overflow-hidden group">
    {/* Animated top gradient bar */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-[hsl(190_100%_50%)] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
    
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <button
        onClick={onViewAll}
        className="text-[hsl(190_100%_50%)] text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg bg-[hsl(190_100%_50%_/_0.1)] transition-all duration-300 hover:bg-[hsl(190_100%_50%_/_0.2)] hover:gap-2 hover:translate-x-1"
      >
        View All <ArrowRight className="h-4 w-4" />
      </button>
    </div>
    
    {isLoading ? (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full bg-[hsl(0_0%_100%_/_0.1)]" />
        ))}
      </div>
    ) : isEmpty ? (
      <div className="text-center py-10">
        <div className="text-5xl opacity-20 mb-4 grayscale group-hover:opacity-40 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-400">
          {emptyIcon}
        </div>
        <p className="text-[hsl(240_10%_73%)] mb-4 text-sm">{emptyText}</p>
        <button
          onClick={() => navigate(emptyAction.path)}
          className="text-primary text-sm font-semibold px-5 py-2 rounded-lg bg-[hsl(18_100%_57%_/_0.15)] border border-[hsl(18_100%_57%_/_0.3)] transition-all duration-300 hover:bg-[hsl(18_100%_57%_/_0.25)] hover:-translate-y-0.5 hover:shadow-[0_4px_15px_hsl(18_100%_57%_/_0.3)]"
        >
          {emptyAction.label}
        </button>
      </div>
    ) : (
      <div className="space-y-3">{children}</div>
    )}
  </div>
);

// List Item Component
interface ListItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  badge?: React.ReactNode;
  onClick: () => void;
}

const ListItem = ({ icon, title, subtitle, badge, onClick }: ListItemProps) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-3 rounded-xl bg-[hsl(0_0%_100%_/_0.03)] hover:bg-[hsl(0_0%_100%_/_0.08)] transition-all duration-300 cursor-pointer group"
  >
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-[hsl(18_100%_57%_/_0.1)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[hsl(18_100%_57%_/_0.2)]">
        {icon}
      </div>
      <div>
        <p className="font-medium text-white">{title}</p>
        {subtitle}
      </div>
    </div>
    {badge}
  </div>
);

export default UserDashboard;
