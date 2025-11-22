import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building } from "lucide-react";
import { useLeadMutations } from "@/hooks/useLeadMutations";
import { LeadDetailModal } from "./LeadDetailModal";
import { formatDistanceToNow } from "date-fns";

interface LeadKanbanBoardProps {
  businessId: string;
  leads: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    status: string | null;
    score: number | null;
    created_at: string | null;
    message: string | null;
  }>;
}

const STATUS_COLUMNS = [
  { id: "new", label: "New", color: "bg-blue-500" },
  { id: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { id: "qualified", label: "Qualified", color: "bg-purple-500" },
  { id: "converted", label: "Converted", color: "bg-green-500" },
  { id: "lost", label: "Lost", color: "bg-red-500" },
];

export function LeadKanbanBoard({ businessId, leads }: LeadKanbanBoardProps) {
  const { updateLeadStatus } = useLeadMutations(businessId);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => (lead.status || "new") === status);
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return "❄️";
    if (score >= 70) return "🔥";
    if (score >= 40) return "🌡️";
    return "❄️";
  };

  return (
    <>
      {/* Mobile: Vertical stack */}
      <div className="lg:hidden space-y-4">
        {STATUS_COLUMNS.map((column) => {
          const columnLeads = getLeadsByStatus(column.id);
          
          return (
            <Card key={column.id} className="overflow-hidden">
              <div className={`p-3 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">{column.label}</h3>
                  <Badge variant="secondary" className="bg-white text-gray-900">
                    {columnLeads.length}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No leads
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="cursor-pointer hover:shadow-md transition"
                      onClick={() => setSelectedLead(lead.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{lead.name}</h4>
                          <span className="text-lg">{getScoreLabel(lead.score)}</span>
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          {lead.company && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{lead.company}</span>
                            </div>
                          )}
                        </div>

                        {lead.created_at && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop: Horizontal grid */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4">
        {STATUS_COLUMNS.map((column) => {
          const columnLeads = getLeadsByStatus(column.id);
          
          return (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold">{column.label}</h3>
                <Badge variant="secondary">{columnLeads.length}</Badge>
              </div>

              <div className="space-y-2 min-h-[400px]">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No leads
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="cursor-pointer hover:shadow-md transition"
                      onClick={() => setSelectedLead(lead.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{lead.name}</h4>
                          <span className="text-lg">{getScoreLabel(lead.score)}</span>
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                          {lead.company && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              <span>{lead.company}</span>
                            </div>
                          )}
                        </div>

                        {lead.message && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {lead.message}
                          </p>
                        )}

                        <div className="mt-2 text-xs text-muted-foreground">
                          {lead.created_at && formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedLead && (
        <LeadDetailModal
          leadId={selectedLead}
          businessId={businessId}
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
        />
      )}
    </>
  );
}
