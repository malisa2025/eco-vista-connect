import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBusinessSubscription } from "@/hooks/useBusinessSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { UsageMeter } from "@/components/subscriptions/UsageMeter";
import { InvoiceTable } from "@/components/subscriptions/InvoiceTable";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function ManageSubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, toggleAutoRenew, cancelSubscription } = useBusinessSubscription(user?.id || "");

  if (!subscription) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-3xl font-bold mb-4">No Active Subscription</h1>
            <p className="text-muted-foreground mb-6">
              Subscribe to unlock premium features and grow your business
            </p>
            <Button onClick={() => navigate("/subscription-plans")}>
              View Plans
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const currentUsage = subscription.current_usage as any || {};
  const planLimits = subscription.subscription_plans?.limits as any || {};

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Manage Subscription</h1>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Current Plan */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{subscription.subscription_plans?.name}</CardTitle>
                    <CardDescription>
                      {subscription.subscription_plans?.billing_period} billing
                    </CardDescription>
                  </div>
                  <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                    {subscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-2xl font-bold">GH₵{subscription.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      per {subscription.subscription_plans?.billing_period}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Next billing date</p>
                    <p className="font-semibold">
                      {format(new Date(subscription.end_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="auto-renew">Auto-renewal</Label>
                    <p className="text-sm text-muted-foreground">
                      {subscription.auto_renew ? "Your subscription will renew automatically" : "Your subscription will end on the billing date"}
                    </p>
                  </div>
                  <Switch
                    id="auto-renew"
                    checked={subscription.auto_renew || false}
                    onCheckedChange={(checked) => toggleAutoRenew.mutate(checked)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate("/subscription-plans")}>
                    Change Plan
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Cancel Subscription</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Your subscription will remain active until {format(new Date(subscription.end_date), "MMM dd, yyyy")}.
                          After that, you'll lose access to premium features.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction onClick={() => cancelSubscription.mutate({ reason: "User requested cancellation" })}>
                          Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>

            {/* Usage Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Usage This Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageMeter
                  label="Jobs Posted"
                  current={currentUsage.jobs_posted || 0}
                  limit={planLimits.jobs_per_month || 0}
                />
                <UsageMeter
                  label="Featured Listings"
                  current={currentUsage.featured_listings || 0}
                  limit={planLimits.featured_listings || 0}
                />
                <UsageMeter
                  label="AI Credits"
                  current={currentUsage.ai_credits_used || 0}
                  limit={planLimits.ai_credits || 0}
                />
              </CardContent>
            </Card>
          </div>

          {/* Billing History */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceTable businessId={subscription.business_id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
