import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface UsageMeterProps {
  label: string;
  current: number;
  limit: number;
}

export function UsageMeter({ label, current, limit }: UsageMeterProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getColor = () => {
    if (isAtLimit) return "bg-destructive";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={isAtLimit ? "text-destructive font-semibold" : ""}>
          {current} / {isUnlimited ? "Unlimited" : limit}
        </span>
      </div>

      {!isUnlimited && (
        <>
          <Progress value={percentage} className={getColor()} />

          {isAtLimit && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>You've reached your limit. Upgrade to continue.</span>
            </div>
          )}

          {isNearLimit && !isAtLimit && (
            <div className="flex items-center gap-2 text-xs text-yellow-600">
              <AlertCircle className="h-3 w-3" />
              <span>Approaching limit. Consider upgrading soon.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
