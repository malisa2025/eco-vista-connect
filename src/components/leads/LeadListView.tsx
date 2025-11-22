import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { LeadDetailModal } from "./LeadDetailModal";

interface LeadListViewProps {
  leads: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    status: string | null;
    score: number | null;
    source: string | null;
    created_at: string | null;
    business_id: string;
  }>;
}

export function LeadListView({ leads }: LeadListViewProps) {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const getScoreColor = (score: number | null) => {
    if (!score) return "secondary";
    if (score >= 70) return "destructive";
    if (score >= 40) return "default";
    return "secondary";
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "new": return "default";
      case "contacted": return "secondary";
      case "qualified": return "default";
      case "converted": return "default";
      case "lost": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone || "-"}</TableCell>
                <TableCell>{lead.company || "-"}</TableCell>
                <TableCell>
                  <Badge variant={getScoreColor(lead.score)}>
                    {lead.score || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(lead.status)}>
                    {lead.status || "new"}
                  </Badge>
                </TableCell>
                <TableCell>{lead.source || "direct"}</TableCell>
                <TableCell>
                  {lead.created_at && formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(lead.id);
                      setSelectedBusinessId(lead.business_id);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedLead && selectedBusinessId && (
        <LeadDetailModal
          leadId={selectedLead}
          businessId={selectedBusinessId}
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
        />
      )}
    </>
  );
}
