import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Plus, Lock } from "lucide-react";
import { useBusinessLeads } from "@/hooks/useBusinessLeads";
import { useBusinessSubscription } from "@/hooks/useBusinessSubscription";
import { LeadKanbanBoard } from "@/components/leads/LeadKanbanBoard";
import { LeadListView } from "@/components/leads/LeadListView";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureLockedModal } from "@/components/subscriptions/FeatureLockedModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function LeadDashboard() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { leads, hotLeads, warmLeads, coldLeads, totalLeads, leadsByStatus, isLoading } = useBusinessLeads(businessId || '', filters);
  const { subscription, isLoading: subLoading } = useBusinessSubscription(businessId || '');

  // Check if user owns this business
  const { data: ownership, isLoading: ownershipLoading } = useQuery({
    queryKey: ['business-ownership', businessId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_owners')
        .select('*')
        .eq('business_id', businessId)
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!businessId && !!user?.id,
  });

  const planName = subscription?.subscription_plans?.name || 'Free';
  const canExport = planName !== 'Free';
  const canUseAdvancedFilters = planName !== 'Free';
  const hasProAccess = ['Pro', 'Premium'].includes(planName);

  const handleExport = () => {
    if (!canExport) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (!leads) return;
    
    const csv = [
      ["Name", "Email", "Phone", "Company", "Status", "Score", "Created"],
      ...leads.map(lead => [
        lead.name,
        lead.email,
        lead.phone || "",
        lead.company || "",
        lead.status || "",
        lead.score || 0,
        new Date(lead.created_at!).toLocaleDateString(),
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  };

  if (isLoading || subLoading || ownershipLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading leads...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Security check: Must own the business
  if (!ownership) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8">
            <Card className="p-8 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">You don't have permission to view this business's leads.</p>
              <Button onClick={() => navigate('/my-businesses')}>Back to My Businesses</Button>
            </Card>
        </div>
      </div>
      <Footer />

      <FeatureLockedModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="Lead Export"
        currentPlan={planName}
        requiredPlan="Pro"
        upgradeBenefits={[
          "Export unlimited leads to CSV",
          "Advanced lead filtering",
          "AI-powered lead scoring",
          "Priority customer support",
        ]}
      />
    </>
  );
}

  // Subscription gate: Require Pro or Premium
  if (!hasProAccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8">
            <Card className="p-8 text-center max-w-2xl mx-auto">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Upgrade to Access Lead Dashboard</h2>
              <p className="text-muted-foreground mb-6">
                The Lead Dashboard is available on Pro and Premium plans. Track, score, and convert more leads with advanced CRM features.
              </p>
              
              <div className="bg-muted rounded-lg p-4 mb-6 text-left">
                <p className="font-medium mb-3">With Pro/Premium, you'll get:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Unlimited lead capture forms
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    AI-powered lead scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Kanban board view with drag-and-drop
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Advanced filtering and segmentation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Lead export to CSV
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Activity timeline tracking
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/my-businesses')}>
                  Back to Dashboard
                </Button>
                <Button onClick={() => navigate('/subscription-plans')}>
                  View Plans & Upgrade
                </Button>
              </div>
            </Card>
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Leads Dashboard</h1>
              <p className="text-muted-foreground">Manage and track your business leads</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={!canExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
                {!canExport && <Lock className="ml-2 h-3 w-3" />}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Leads</div>
                <div className="text-3xl font-bold">{totalLeads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">🔥 Hot Leads</div>
                <div className="text-3xl font-bold text-red-600">{hotLeads.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">🌡️ Warm Leads</div>
                <div className="text-3xl font-bold text-yellow-600">{warmLeads.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">❄️ Cold Leads</div>
                <div className="text-3xl font-bold text-blue-600">{coldLeads.length}</div>
              </CardContent>
            </Card>
          </div>

          {canUseAdvancedFilters ? (
            <LeadFilters onFilterChange={setFilters} />
          ) : (
            <Card className="p-4 bg-muted/50 border-dashed">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Advanced filters available on Pro plan</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/subscription-plans')}>
                  Upgrade
                </Button>
              </div>
            </Card>
          )}

          <Tabs defaultValue="kanban" className="mt-6">
            <TabsList>
              <TabsTrigger value="kanban">Kanban View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="kanban">
              <LeadKanbanBoard businessId={businessId || ''} leads={leads || []} />
            </TabsContent>

            <TabsContent value="list">
              <LeadListView leads={leads || []} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}
