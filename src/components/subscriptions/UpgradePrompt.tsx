import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  message: string;
  features: string[];
  dismissable?: boolean;
}

export function UpgradePrompt({ message, features, dismissable = true }: UpgradePromptProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("upgrade-prompt-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setVisible(false);
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("upgrade-prompt-dismissed", Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-primary/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-primary/20 p-2 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{message}</p>
              <div className="flex gap-4 mt-1">
                {features.map((feature, index) => (
                  <span key={index} className="text-sm text-muted-foreground">
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/subscription-plans")}>
              Upgrade Now
            </Button>
            {dismissable && (
              <Button variant="ghost" size="icon" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
