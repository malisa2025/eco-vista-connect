import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useJob } from "@/hooks/useJobs";
import { useJobApplications, useApplicationMutations } from "@/hooks/useJobApplications";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, Calendar, Users, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const JobApplications = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: job } = useJob(jobId!);
  const { data: applications, isLoading } = useJobApplications(jobId!);
  const { updateApplicationStatus } = useApplicationMutations();

  const filteredApplications = applications?.filter(app =>
    statusFilter === "all" || app.status === statusFilter
  );

  const statusCounts = {
    total: applications?.length || 0,
    pending: applications?.filter(a => a.status === "pending").length || 0,
    shortlisted: applications?.filter(a => a.status === "shortlisted").length || 0,
    accepted: applications?.filter(a => a.status === "accepted").length || 0,
  };

  const statusColors: Record<string, string> = {
    pending: "bg-secondary/10 text-secondary",
    reviewed: "bg-primary/10 text-primary",
    shortlisted: "bg-primary text-primary-foreground",
    rejected: "bg-destructive/10 text-destructive",
    accepted: "bg-primary text-primary-foreground",
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await updateApplicationStatus.mutateAsync({
        id: applicationId,
        status: newStatus as any,
      });
      toast.success("Application status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Job Not Found</h1>
              <Button onClick={() => navigate("/my-businesses")}>Back to Dashboard</Button>
            </div>
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
          {/* Breadcrumb */}
          <div className="text-sm text-muted-foreground mb-6">
            <Link to="/my-businesses" className="hover:text-foreground">Dashboard</Link>
            {" > "}
            <Link to="/my-businesses" className="hover:text-foreground">Job Listings</Link>
            {" > "}
            <span className="text-foreground">{job.title}</span>
          </div>

          {/* Job Header */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{job.title}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted {formatDistanceToNow(new Date(job.posted_at || job.created_at!), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {statusCounts.total} applications
                  </span>
                  <Badge variant="outline">{job.status}</Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(`/jobs/${jobId}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Job
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-2xl font-bold text-foreground">{statusCounts.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Pending</div>
              <div className="text-2xl font-bold text-foreground">{statusCounts.pending}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Shortlisted</div>
              <div className="text-2xl font-bold text-foreground">{statusCounts.shortlisted}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Accepted</div>
              <div className="text-2xl font-bold text-foreground">{statusCounts.accepted}</div>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex justify-between items-center mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Applications Table */}
          <Card>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading applications...</div>
            ) : filteredApplications && filteredApplications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Video</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map(application => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={application.profiles?.avatar_url || undefined} />
                            <AvatarFallback>
                              {application.profiles?.full_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {application.profiles?.full_name || "Anonymous"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {application.profiles?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(application.applied_at!), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[application.status || "pending"]}>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {application.video_url && (
                          <Video className="w-4 h-4 text-primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={application.status || "pending"}
                          onValueChange={(value) => handleStatusChange(application.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No applications yet
                </h3>
                <p className="text-muted-foreground">
                  Applications will appear here when candidates apply
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobApplications;
