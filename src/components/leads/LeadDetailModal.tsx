import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Building, MapPin } from "lucide-react";
import { useState } from "react";
import { useLeadMutations } from "@/hooks/useLeadMutations";

interface LeadDetailModalProps {
  leadId: string;
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailModal({ leadId, businessId, open, onOpenChange }: LeadDetailModalProps) {
  const { updateLeadStatus, addLeadNote } = useLeadMutations(businessId);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("new");

  const handleStatusUpdate = async (newStatus: string) => {
    await updateLeadStatus.mutateAsync({ leadId, status: newStatus });
    setStatus(newStatus);
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await addLeadNote.mutateAsync({ leadId, content: note });
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={handleStatusUpdate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Add Note</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            <Button onClick={handleAddNote} className="mt-2" size="sm">Add Note</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
