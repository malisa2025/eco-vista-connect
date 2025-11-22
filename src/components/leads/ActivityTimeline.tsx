import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Phone, Mail, User, FileText, Tag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  activity_type: string;
  content: string | null;
  created_at: string;
  metadata?: any;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "note":
      return FileText;
    case "email":
      return Mail;
    case "call":
      return Phone;
    case "status_change":
      return Tag;
    case "assignment":
      return User;
    default:
      return MessageSquare;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "note":
      return "bg-blue-500";
    case "email":
      return "bg-green-500";
    case "call":
      return "bg-purple-500";
    case "status_change":
      return "bg-orange-500";
    case "assignment":
      return "bg-pink-500";
    default:
      return "bg-gray-500";
  }
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No activity yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.activity_type);
          const colorClass = getActivityColor(activity.activity_type);

          return (
            <div key={activity.id} className="flex gap-3">
              <div className="relative">
                <div className={`p-2 rounded-full ${colorClass} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                {index < activities.length - 1 && (
                  <div className="absolute left-1/2 top-10 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                )}
              </div>

              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-1">
                  <Badge variant="outline" className="capitalize">
                    {activity.activity_type.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {activity.content && (
                  <p className="text-sm mt-2 whitespace-pre-wrap">
                    {activity.content}
                  </p>
                )}

                {activity.metadata && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
