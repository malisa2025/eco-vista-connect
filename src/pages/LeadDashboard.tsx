import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useBusinessLeads } from "@/hooks/useBusinessLeads";
import { LeadKanbanBoard } from "@/components/leads/LeadKanbanBoard";
import { LeadListView } from "@/components/leads/LeadListView";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { Card, CardContent } from "@/components/ui/card";

export default function LeadDashboard() {
  const { businessId } = useParams();
  const [filters, setFilters] = useState({});
  const { leads, hotLeads, warmLeads, coldLeads, totalLeads, leadsByStatus, isLoading } = useBusinessLeads(businessId || '', filters);

  const handleExport = () => {
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

  if (isLoading) {
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
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
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

          <LeadFilters onFilterChange={setFilters} />

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
