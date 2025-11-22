import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLeadMutations } from "@/hooks/useLeadMutations";
import { toast } from "sonner";

interface EmbeddedLeadFormProps {
  businessId: string;
  title?: string;
  description?: string;
  collapsible?: boolean;
}

export function EmbeddedLeadForm({
  businessId,
  title = "Get in Touch",
  description = "Fill out the form below and we'll get back to you soon.",
  collapsible = false,
}: EmbeddedLeadFormProps) {
  const [expanded, setExpanded] = useState(!collapsible);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const { createLead } = useLeadMutations(businessId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createLead.mutateAsync({
        business_id: businessId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message || null,
        source: "embedded_form",
      });

      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader className={collapsible ? "cursor-pointer" : ""} onClick={() => collapsible && setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          {collapsible && (
            <Button variant="ghost" size="icon">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="embed-name">Name *</Label>
              <Input
                id="embed-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="embed-email">Email *</Label>
              <Input
                id="embed-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="embed-phone">Phone</Label>
              <Input
                id="embed-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="embed-message">Message</Label>
              <Textarea
                id="embed-message"
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={createLead.isPending}>
              {createLead.isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
