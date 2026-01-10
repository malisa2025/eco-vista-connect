import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDashboard } from "@/hooks/useUserDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Clock
} from "lucide-react";
import { format } from "date-fns";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { 
    stats, 
    recentReservations, 
    recentBookings, 
    recentApplications, 
    savedJobs,
    isLoading 
  } = useUserDashboard();

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
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    onClick 
  }: { 
    title: string; 
    value: number; 
    icon: React.ElementType; 
    onClick: () => void;
  }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-12 mt-1" />
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Upcoming Dinners" 
            value={stats.upcomingReservations} 
            icon={UtensilsCrossed}
            onClick={() => navigate('/my-reservations')}
          />
          <StatCard 
            title="Hotel Bookings" 
            value={stats.upcomingBookings} 
            icon={Hotel}
            onClick={() => navigate('/my-bookings')}
          />
          <StatCard 
            title="Saved Jobs" 
            value={stats.savedJobs} 
            icon={Briefcase}
            onClick={() => navigate('/saved-jobs')}
          />
          <StatCard 
            title="Favorite Places" 
            value={stats.favoriteBusinesses} 
            icon={Heart}
            onClick={() => navigate('/favorites')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Upcoming Reservations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Upcoming Reservations
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/my-reservations')}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentReservations.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming reservations</p>
                    <Button variant="link" size="sm" onClick={() => navigate('/businesses')}>
                      Browse restaurants
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReservations.map((reservation) => (
                      <div 
                        key={reservation.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate('/my-reservations')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UtensilsCrossed className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{reservation.business?.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(reservation.reservation_date), 'MMM d')}
                              <Clock className="h-3 w-3 ml-1" />
                              {reservation.reservation_time}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Hotel Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Upcoming Hotel Stays
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/my-bookings')}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Hotel className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming hotel stays</p>
                    <Button variant="link" size="sm" onClick={() => navigate('/hotels')}>
                      Browse hotels
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate('/my-bookings')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Hotel className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.hotel?.business?.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(booking.check_in_date), 'MMM d')} - {format(new Date(booking.check_out_date), 'MMM d')}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Recent Applications
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/my-applications')}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentApplications.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No job applications yet</p>
                    <Button variant="link" size="sm" onClick={() => navigate('/jobs')}>
                      Browse jobs
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentApplications.map((application) => (
                      <div 
                        key={application.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate('/my-applications')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{application.job?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {application.job?.business?.name}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Saved Jobs
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/saved-jobs')}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : savedJobs.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No saved jobs</p>
                    <Button variant="link" size="sm" onClick={() => navigate('/jobs')}>
                      Browse jobs
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedJobs.map((saved) => (
                      <div 
                        key={saved.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => navigate(`/jobs/${saved.job?.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{saved.job?.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {saved.job?.business?.name}
                              {saved.job?.location && (
                                <>
                                  <MapPin className="h-3 w-3 ml-1" />
                                  {saved.job.location}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/businesses')}
              >
                <Building2 className="h-6 w-6" />
                <span>Browse Businesses</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/jobs')}
              >
                <Briefcase className="h-6 w-6" />
                <span>Find Jobs</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/hotels')}
              >
                <Hotel className="h-6 w-6" />
                <span>Book Hotels</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate('/profile')}
              >
                <Heart className="h-6 w-6" />
                <span>My Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
