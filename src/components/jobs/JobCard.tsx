import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Clock, Users, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    location: string | null;
    job_type: string;
    experience_level: string;
    salary_range: string | null;
    posted_at: string | null;
    applications_count: number | null;
    require_video: boolean | null;
    businesses: {
      name: string;
      logo_url: string | null;
    } | null;
  };
}

const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();

  const jobTypeColors: Record<string, string> = {
    full_time: "bg-secondary/10 text-secondary border-secondary/20",
    part_time: "bg-primary/10 text-primary border-primary/20",
    contract: "bg-accent/10 text-accent border-accent/20",
    internship: "bg-muted text-muted-foreground border-border",
  };

  const experienceLevelLabels: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior Level",
    executive: "Executive",
  };

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    internship: "Internship",
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-card transition-smooth group"
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            {job.businesses?.logo_url ? (
              <img
                src={job.businesses.logo_url}
                alt={job.businesses.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Job Title */}
            <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-smooth truncate">
              {job.title}
            </h3>

            {/* Company Name */}
            <p className="text-sm text-muted-foreground mb-3">
              {job.businesses?.name || "Unknown Company"}
            </p>

            {/* Job Details */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className={jobTypeColors[job.job_type]}>
                {jobTypeLabels[job.job_type] || job.job_type}
              </Badge>
              <Badge variant="outline">
                {experienceLevelLabels[job.experience_level] || job.experience_level}
              </Badge>
              {job.require_video && (
                <Badge variant="outline" className="gap-1">
                  <Video className="h-3 w-3" />
                  Video Required
                </Badge>
              )}
            </div>

            {/* Location & Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.posted_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(job.posted_at), { addSuffix: true })}</span>
                </div>
              )}
              {job.applications_count !== null && job.applications_count > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{job.applications_count} {job.applications_count === 1 ? 'application' : 'applications'}</span>
                </div>
              )}
            </div>

            {/* Salary Range */}
            {job.salary_range && (
              <div className="mt-3 text-sm font-semibold text-foreground">
                {job.salary_range}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
