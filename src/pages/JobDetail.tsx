import { useParams, useNavigate, Link } from "react-router-dom";
import { useJob } from "@/hooks/useJobs";
import { useJobSeekerSubscription } from "@/hooks/useJobApplications";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Briefcase, Clock, Eye, Calendar, 
  Building2, Share2, CheckCircle2, Video 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import ApplicationForm from "@/components/jobs/ApplicationForm";
import { useMyApplications } from "@/hooks/useJobApplications";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const { data: job, isLoading } = useJob(id!);
  const { data: subscription } = useJobSeekerSubscription(user?.id || "");
  const { data: myApplications } = useMyApplications(user?.id || "");

  const hasApplied = myApplications?.some(app => app.job_id === id);
  const isSubscribed = subscription?.status === "active";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Job Not Found</h1>
            <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const jobTypeColors: Record<string, string> = {
    full_time: "bg-primary/10 text-primary",
    part_time: "bg-secondary/10 text-secondary",
    contract: "bg-accent/10 text-accent-foreground",
    internship: "bg-muted text-muted-foreground",
  };

  const experienceColors: Record<string, string> = {
    entry: "bg-primary/10 text-primary",
    mid: "bg-secondary/10 text-secondary",
    senior: "bg-accent/10 text-accent-foreground",
    executive: "bg-muted text-muted-foreground",
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            {" > "}
            <Link to="/jobs" className="hover:text-foreground">Jobs</Link>
            {" > "}
            <span className="text-foreground">{job.title}</span>
          </div>

          {/* Job Header */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {job.businesses?.logo_url ? (
                  <img 
                    src={job.businesses.logo_url} 
                    alt={job.businesses.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
                <Link 
                  to={`/businesses/${job.business_id}`}
                  className="text-xl text-primary hover:underline mb-4 block"
                >
                  {job.businesses?.name}
                </Link>

                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </Badge>
                  <Badge className={jobTypeColors[job.job_type]}>
                    <Briefcase className="w-3 h-3 mr-1" />
                    {job.job_type.replace("_", " ")}
                  </Badge>
                  <Badge className={experienceColors[job.experience_level]}>
                    {job.experience_level}
                  </Badge>
                  {job.salary_range && (
                    <Badge variant="outline">GHS {job.salary_range}</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted {formatDistanceToNow(new Date(job.posted_at || job.created_at!), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Expires {formatDistanceToNow(new Date(job.expires_at!), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {job.views_count || 0} views
                  </span>
                </div>
              </div>

              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Job Description</h2>
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                  {job.description}
                </div>
              </Card>

              {job.responsibilities && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Responsibilities</h2>
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    {job.responsibilities}
                  </div>
                </Card>
              )}

              {job.requirements && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Requirements</h2>
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    {job.requirements}
                  </div>
                </Card>
              )}

              {job.require_video && (
                <Card className="p-6 border-primary/20 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <Video className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Video Submission Required</h3>
                      <p className="text-muted-foreground mb-2">
                        This position requires a video submission as part of your application.
                      </p>
                      {job.video_prompt && (
                        <p className="text-foreground font-medium">
                          "{job.video_prompt}"
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Application Card */}
                <Card className="p-6">
                  {!user ? (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">Sign in to apply for this position</p>
                      <Button onClick={() => navigate("/auth")} className="w-full">
                        Sign In to Apply
                      </Button>
                    </div>
                  ) : !isSubscribed ? (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Job Seeker Subscription Required</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          Apply to unlimited jobs
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          Profile visibility to employers
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          Application tracking
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          Email notifications
                        </li>
                      </ul>
                      <div className="text-2xl font-bold text-foreground mb-4">10 GHS/month</div>
                      <Button onClick={() => navigate("/subscribe-job-seeker")} className="w-full">
                        Subscribe Now
                      </Button>
                    </div>
                  ) : hasApplied ? (
                    <div className="text-center">
                      <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground mb-2">Application Submitted</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You've already applied for this position
                      </p>
                      <Button variant="outline" onClick={() => navigate("/my-applications")} className="w-full">
                        View My Applications
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Button onClick={() => setShowApplicationForm(true)} className="w-full mb-3">
                        Apply for this Position
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Your application will be sent to the employer
                      </p>
                    </div>
                  )}
                </Card>

                {/* Company Info Card */}
                <Card className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">About the Company</h3>
                  {job.businesses?.logo_url && (
                    <img 
                      src={job.businesses.logo_url} 
                      alt={job.businesses.name}
                      className="w-16 h-16 rounded-lg object-cover mb-3"
                    />
                  )}
                  <Link 
                    to={`/businesses/${job.business_id}`}
                    className="text-lg font-semibold text-foreground hover:text-primary block mb-2"
                  >
                    {job.businesses?.name}
                  </Link>
                  {job.businesses?.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {job.businesses.description}
                    </p>
                  )}
                  <Separator className="my-4" />
                  <Link to={`/businesses/${job.business_id}`}>
                    <Button variant="outline" className="w-full">
                      View Company Profile
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <ApplicationForm 
          jobId={id!}
          jobTitle={job.title}
          requireVideo={job.require_video || false}
          videoPrompt={job.video_prompt || undefined}
          onClose={() => setShowApplicationForm(false)}
        />
      )}

      <Footer />
    </>
  );
};

export default JobDetail;
