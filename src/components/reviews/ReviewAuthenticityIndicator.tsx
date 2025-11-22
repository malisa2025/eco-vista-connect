import { ShieldCheck, ShieldAlert, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReviewAuthenticityIndicatorProps {
  authenticityScore?: number;
  isVerifiedPurchase?: boolean;
  flaggedAsFake?: boolean;
  className?: string;
}

const ReviewAuthenticityIndicator = ({
  authenticityScore = 50,
  isVerifiedPurchase = false,
  flaggedAsFake = false,
  className
}: ReviewAuthenticityIndicatorProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Highly Authentic';
    if (score >= 60) return 'Likely Authentic';
    if (score >= 40) return 'Needs Review';
    return 'Suspicious';
  };

  if (flaggedAsFake) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className={cn("gap-1", className)}>
              <Flag className="h-3 w-3" />
              <span className="text-xs">Flagged</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">This review has been flagged as potentially fake</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isVerifiedPurchase && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-3 w-3" />
                <span className="text-xs">Verified</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Verified customer purchase</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              getScoreColor(authenticityScore)
            )}>
              {authenticityScore >= 60 ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5" />
              )}
              <span>{authenticityScore}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="text-xs font-semibold">{getScoreLabel(authenticityScore)}</p>
              <p className="text-xs text-muted-foreground">
                Authenticity Score: {authenticityScore}/100
              </p>
              <p className="text-xs text-muted-foreground">
                Based on AI analysis of content patterns
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ReviewAuthenticityIndicator;
