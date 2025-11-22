import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TrialBannerProps {
  trialEndDate: Date;
  planName: string;
}

export function TrialBanner({ trialEndDate, planName }: TrialBannerProps) {
  const navigate = useNavigate();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calculateDaysLeft = () => {
      const now = new Date();
      const diff = trialEndDate.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(Math.max(0, days));
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [trialEndDate]);

  if (daysLeft <= 0) return null;

  const isUrgent = daysLeft <= 3;

  return (
    <div className={`border-b ${isUrgent ? "bg-destructive/10 border-destructive/20" : "bg-primary/10 border-primary/20"}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isUrgent ? "bg-destructive/20" : "bg-primary/20"}`}>
              {isUrgent ? (
                <Clock className={`h-5 w-5 ${isUrgent ? "text-destructive" : "text-primary"}`} />
              ) : (
                <Zap className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {daysLeft} {daysLeft === 1 ? "day" : "days"} left in your {planName} trial
              </p>
              <p className="text-sm text-muted-foreground">
                Subscribe now to keep access to all premium features
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/subscription-plans")}
            variant={isUrgent ? "destructive" : "default"}
          >
            Subscribe Now
          </Button>
        </div>
      </div>
    </div>
  );
}
