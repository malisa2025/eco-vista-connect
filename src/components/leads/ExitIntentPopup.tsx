import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLeadMutations } from "@/hooks/useLeadMutations";
import { toast } from "sonner";

interface ExitIntentPopupProps {
  businessId: string;
  businessName: string;
}

export function ExitIntentPopup({ businessId, businessName }: ExitIntentPopupProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const { createLead } = useLeadMutations(businessId);

  useEffect(() => {
    // Check if already dismissed in session
    const isDismissed = sessionStorage.getItem(`exit-intent-${businessId}`);
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed && !open) {
        setOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [businessId, dismissed, open]);

  const handleClose = () => {
    setOpen(false);
    setDismissed(true);
    sessionStorage.setItem(`exit-intent-${businessId}`, "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createLead.mutateAsync({
        business_id: businessId,
        name: formData.name,
        email: formData.email,
        source: "exit_intent",
      });

      toast.success("Thanks! We'll be in touch soon.");
      handleClose();
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wait! Before you go...</DialogTitle>
          <DialogDescription>
            Get exclusive updates and special offers from {businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exit-name">Name</Label>
              <Input
                id="exit-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exit-email">Email</Label>
              <Input
                id="exit-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={createLead.isPending}>
              {createLead.isPending ? "Submitting..." : "Stay Updated"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
