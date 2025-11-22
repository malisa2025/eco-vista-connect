import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureLockedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  currentPlan?: string;
  requiredPlan: string;
  upgradeBenefits: string[];
}

export function FeatureLockedModal({
  open,
  onOpenChange,
  feature,
  currentPlan = "Free",
  requiredPlan,
  upgradeBenefits,
}: FeatureLockedModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Upgrade to Access {feature}</DialogTitle>
          <DialogDescription className="text-center">
            This feature is available on the {requiredPlan} plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">Your current plan</p>
            <p className="text-2xl font-bold">{currentPlan}</p>
          </div>

          <div className="rounded-lg border-2 border-primary p-4">
            <p className="text-sm font-medium mb-2">Upgrade to</p>
            <p className="text-2xl font-bold text-primary">{requiredPlan}</p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">With {requiredPlan}, you'll get:</p>
            <ul className="space-y-2">
              {upgradeBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
            <Button className="flex-1" onClick={() => {
              onOpenChange(false);
              navigate("/subscription-plans");
            }}>
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
