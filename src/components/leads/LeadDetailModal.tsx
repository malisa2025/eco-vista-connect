import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Building, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { useLeadMutations } from "@/hooks/useLeadMutations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadDetailModalProps {
  leadId: string;
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailModal({ leadId, businessId, open, onOpenChange }: LeadDetailModalProps) {
  const queryClient = useQueryClient();
  const { updateLeadStatus, addLeadNote } = useLeadMutations(businessId);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("new");
  const [isGeneratingScore, setIsGeneratingScore] = useState(false);
  const [leadScore, setLeadScore] = useState(0);

  // Fetch lead details
  const { data: lead } = useQuery({
    queryKey: ['lead-detail', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_leads')
        .select('*')
        .eq('id', leadId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: open && !!leadId,
  });

  // Update local state when lead data loads
  useEffect(() => {
    if (lead) {
      setStatus(lead.status || 'new');
      setLeadScore(lead.score || 0);
    }
  }, [lead]);

  // Generate lead score using AI
  const generateScore = useCallback(async () => {
    if (!leadId) return;
    
    setIsGeneratingScore(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lead-score', {
        body: { leadId }
      });

      if (error) throw error;

      if (data?.score !== undefined) {
        setLeadScore(data.score);
        
        // Update the lead in the database
        const { error: updateError } = await supabase
          .from('business_leads')
          .update({ score: data.score })
          .eq('id', leadId);

        if (updateError) throw updateError;

        queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
        queryClient.invalidateQueries({ queryKey: ['business-leads'] });
        toast.success("Lead score generated successfully");
      }
    } catch (error: any) {
      console.error('Error generating lead score:', error);
      toast.error("Failed to generate lead score");
    } finally {
      setIsGeneratingScore(false);
    }
  }, [leadId]);

  // Auto-generate score when modal opens if score is missing
  useEffect(() => {
    if (open && lead && (!lead.score || lead.score === 0)) {
      generateScore();
    }
  }, [open, lead?.id, generateScore]);

  const handleStatusUpdate = async (newStatus: string) => {
    await updateLeadStatus.mutateAsync({ leadId, status: newStatus });
    setStatus(newStatus);
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    await addLeadNote.mutateAsync({ leadId, content: note });
    setNote("");
  };

  if (!lead) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{lead.name}</DialogTitle>
          <DialogDescription>View lead information and activity history</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Lead Score */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Lead Score</span>
                {isGeneratingScore && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  leadScore >= 70 ? "default" : 
                  leadScore >= 40 ? "secondary" : 
                  "outline"
                }>
                  {leadScore >= 70 ? "🔥 Hot" : leadScore >= 40 ? "🌡️ Warm" : "❄️ Cold"} - {leadScore}/100
                </Badge>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={generateScore}
                  disabled={isGeneratingScore}
                >
                  {isGeneratingScore ? "Analyzing..." : "Refresh"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              AI-powered score based on engagement, profile completeness, and behavior patterns
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                  {lead.phone}
                </a>
              </div>
            )}
            {lead.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{lead.company}</span>
              </div>
            )}
          </div>

          {/* Message */}
          {lead.message && (
            <div>
              <label className="text-sm font-medium">Message</label>
              <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                {lead.message}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={handleStatusUpdate}>
              <SelectTrigger className="mt-1">
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

          {/* Add Note */}
          <div>
            <label className="text-sm font-medium">Add Note</label>
            <Textarea 
              value={note} 
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this lead..."
              className="mt-1"
            />
            <Button onClick={handleAddNote} className="mt-2" size="sm">
              Add Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
