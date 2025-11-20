import { useAuth } from "@/contexts/AuthContext";
import { useJobAlerts, useJobAlertMutations } from "@/hooks/useJobAlerts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreateAlertDialog from "@/components/jobs/CreateAlertDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Trash2 } from "lucide-react";

const JobAlerts = () => {
  const { user } = useAuth();
  const { data: alerts, isLoading } = useJobAlerts(user?.id);
  const { updateAlert, deleteAlert } = useJobAlertMutations();

  const handleToggle = (alertId: string, isActive: boolean) => {
    updateAlert.mutate({ alertId, alert: { is_active: isActive } });
  };

  const handleDelete = (alertId: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      deleteAlert.mutate(alertId);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bell className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Job Alerts</h1>
              </div>
              <p className="text-muted-foreground">
                Get notified when new jobs match your criteria
              </p>
            </div>
            <CreateAlertDialog />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert: any) => (
                <Card key={alert.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {alert.name}
                        </h3>
                        <Badge variant={alert.is_active ? "default" : "secondary"}>
                          {alert.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {alert.keywords && (
                          <Badge variant="outline">Keywords: {alert.keywords}</Badge>
                        )}
                        {alert.category && (
                          <Badge variant="outline">{alert.category}</Badge>
                        )}
                        {alert.location && (
                          <Badge variant="outline">{alert.location}</Badge>
                        )}
                        {alert.job_type && (
                          <Badge variant="outline">{alert.job_type}</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Frequency: {alert.frequency}
                        {alert.last_sent_at && ` • Last sent: ${new Date(alert.last_sent_at).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={(checked) => handleToggle(alert.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No job alerts yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your first alert to start receiving job notifications
              </p>
              <CreateAlertDialog />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobAlerts;
