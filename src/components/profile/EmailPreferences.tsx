import { useAuth } from "@/contexts/AuthContext";
import { useEmailPreferences } from "@/hooks/useNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail, Bell, Calendar, TrendingUp, Megaphone } from "lucide-react";

export const EmailPreferences = () => {
  const { user } = useAuth();
  const { preferences, isLoading, updatePreferences } = useEmailPreferences(user?.id);

  if (isLoading) {
    return <div className="text-center py-8">Loading preferences...</div>;
  }

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences.mutate({ [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Preferences
        </CardTitle>
        <CardDescription>
          Manage which emails you receive from us
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="application_notifications">
                  Application Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about application status changes and new applications to your jobs
                </p>
              </div>
            </div>
            <Switch
              id="application_notifications"
              checked={preferences?.application_notifications ?? true}
              onCheckedChange={(checked) =>
                handleToggle("application_notifications", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="job_alert_emails">Job Alert Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily or weekly emails with jobs matching your alerts
                </p>
              </div>
            </div>
            <Switch
              id="job_alert_emails"
              checked={preferences?.job_alert_emails ?? true}
              onCheckedChange={(checked) =>
                handleToggle("job_alert_emails", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="interview_reminders">Interview Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders 24 hours before scheduled interviews
                </p>
              </div>
            </div>
            <Switch
              id="interview_reminders"
              checked={preferences?.interview_reminders ?? true}
              onCheckedChange={(checked) =>
                handleToggle("interview_reminders", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="digest_emails">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly summaries of your hiring activity (for employers)
                </p>
              </div>
            </div>
            <Switch
              id="digest_emails"
              checked={preferences?.digest_emails ?? true}
              onCheckedChange={(checked) => handleToggle("digest_emails", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Megaphone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor="marketing_emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and platform news
                </p>
              </div>
            </div>
            <Switch
              id="marketing_emails"
              checked={preferences?.marketing_emails ?? true}
              onCheckedChange={(checked) =>
                handleToggle("marketing_emails", checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
