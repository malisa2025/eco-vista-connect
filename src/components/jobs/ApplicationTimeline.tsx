import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Eye, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApplicationTimelineProps {
  application: {
    applied_at: string;
    reviewed_at?: string | null;
    status_changed_at?: string | null;
    status: string;
  };
}

const ApplicationTimeline = ({ application }: ApplicationTimelineProps) => {
  const timelineSteps = [
    {
      label: "Applied",
      date: application.applied_at,
      icon: CheckCircle2,
      color: "text-primary",
      completed: true,
    },
    {
      label: "Under Review",
      date: application.reviewed_at,
      icon: Eye,
      color: "text-secondary",
      completed: !!application.reviewed_at || ["reviewed", "shortlisted", "accepted", "rejected"].includes(application.status),
    },
    {
      label: application.status === "rejected" ? "Rejected" : application.status === "accepted" ? "Accepted" : "Decision",
      date: application.status_changed_at,
      icon: application.status === "rejected" ? XCircle : application.status === "accepted" ? CheckCircle2 : AlertCircle,
      color: application.status === "rejected" ? "text-destructive" : application.status === "accepted" ? "text-green-600" : "text-yellow-600",
      completed: ["shortlisted", "accepted", "rejected"].includes(application.status),
    },
  ];

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <h4 className="font-semibold mb-4">Application Timeline</h4>
        <div className="space-y-6">
          {timelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    step.completed 
                      ? `${step.color} border-current bg-current/10` 
                      : "border-muted text-muted-foreground bg-muted/50"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={`w-0.5 h-12 ${
                      step.completed ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="font-medium">{step.label}</div>
                  {step.date && (
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(step.date), { addSuffix: true })}
                    </div>
                  )}
                  {!step.date && step.completed && (
                    <div className="text-sm text-muted-foreground">In progress</div>
                  )}
                  {!step.completed && (
                    <div className="text-sm text-muted-foreground">Pending</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Status */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge variant={
              application.status === "accepted" ? "default" :
              application.status === "rejected" ? "destructive" :
              application.status === "shortlisted" ? "default" :
              "secondary"
            }>
              {application.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationTimeline;
