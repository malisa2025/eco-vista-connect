import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications, useJobSeekerSubscription } from "@/hooks/useJobApplications";
import { useWithdrawApplication } from "@/hooks/useWithdrawApplication";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
import { Briefcase, Calendar, Building2, Search, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ApplicationTimeline from "@/components/jobs/ApplicationTimeline";

const MyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [withdrawingApp, setWithdrawingApp] = useState<string | null>(null);

  const { data: applications, isLoading } = useMyApplications(user?.id || "");
  const { data: subscription } = useJobSeekerSubscription(user?.id || "");
  const withdrawMutation = useWithdrawApplication();

  const isSubscribed = subscription?.status === "active";

  const filteredApplications = applications?.filter(app => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSearch = !searchQuery || 
      app.jobs?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobs?.businesses?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    total: applications?.length || 0,
    pending: applications?.filter(a => a.status === "pending").length || 0,
    reviewed: applications?.filter(a => a.status === "reviewed").length || 0,
    shortlisted: applications?.filter(a => a.status === "shortlisted").length || 0,
    accepted: applications?.filter(a => a.status === "accepted").length || 0,
    rejected: applications?.filter(a => a.status === "rejected").length || 0,
  };

  const statusColors: Record<string, string> = {
    pending: "bg-secondary/10 text-secondary border-secondary/20",
    reviewed: "bg-primary/10 text-primary border-primary/20",
    shortlisted: "bg-primary text-primary-foreground",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  const handleWithdraw = (appId: string) => {
    setWithdrawingApp(appId);
  };

  const confirmWithdraw = () => {
    if (withdrawingApp) {
      withdrawMutation.mutate(withdrawingApp);
      setWithdrawingApp(null);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Sign In Required</h1>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">My Job Applications</h1>
            <p className="text-muted-foreground mb-6">
              Track and manage all your job applications in one place
            </p>
            
            {/* Subscription Status */}
            <div className="flex items-center gap-4 mb-6">
              {isSubscribed ? (
                <Badge className="bg-primary text-primary-foreground">
                  Active Subscriber
                </Badge>
              ) : (
                <div className="flex items-center gap-3">
                  <Badge variant="destructive">Subscription Expired</Badge>
                  <Button size="sm" onClick={() => navigate("/subscribe-job-seeker")}>
                    Renew Subscription
                  </Button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Total</div>
                <div className="text-2xl font-bold">{statusCounts.total}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Pending</div>
                <div className="text-2xl font-bold">{statusCounts.pending}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Reviewed</div>
                <div className="text-2xl font-bold">{statusCounts.reviewed}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Shortlisted</div>
                <div className="text-2xl font-bold">{statusCounts.shortlisted}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Accepted</div>
                <div className="text-2xl font-bold text-green-600">{statusCounts.accepted}</div>
              </Card>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Applications List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          ) : filteredApplications && filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map(application => (
                <Card key={application.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        {application.jobs?.businesses?.logo_url ? (
                          <img 
                            src={application.jobs.businesses.logo_url} 
                            alt={application.jobs.businesses.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <Link 
                              to={`/jobs/${application.job_id}`}
                              className="text-xl font-semibold hover:text-primary inline-flex items-center gap-2"
                            >
                              {application.jobs?.title}
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <p className="text-muted-foreground">
                              {application.jobs?.businesses?.name}
                            </p>
                          </div>
                          <Badge className={`${statusColors[application.status || "pending"]} border`}>
                            {application.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {formatDistanceToNow(new Date(application.applied_at!), { addSuffix: true })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {application.jobs?.job_type?.replace("_", " ")}
                          </span>
                          {application.jobs?.location && (
                            <span className="flex items-center gap-1">
                              📍 {application.jobs.location}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/jobs/${application.job_id}`)}
                          >
                            View Job
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setExpandedApp(expandedApp === application.id ? null : application.id)}
                          >
                            {expandedApp === application.id ? "Hide Timeline" : "View Timeline"}
                          </Button>
                          {application.status === "pending" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleWithdraw(application.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  {expandedApp === application.id && (
                    <div className="border-t px-6 pb-6">
                      <ApplicationTimeline application={application} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No applications yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start applying to jobs and track your applications here
              </p>
              <Button onClick={() => navigate("/jobs")}>
                Browse Jobs
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={!!withdrawingApp} onOpenChange={() => setWithdrawingApp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action cannot be undone.
              You will need to reapply if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmWithdraw}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Withdraw Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </>
  );
};

export default MyApplications;
