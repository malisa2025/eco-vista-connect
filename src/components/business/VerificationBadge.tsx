import { Shield, CheckCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerificationBadgeProps {
  tier: 'none' | 'basic' | 'government' | 'premium';
  trustScore?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VerificationBadge = ({
  tier,
  trustScore,
  className,
  showLabel = false,
  size = 'md'
}: VerificationBadgeProps) => {
  if (tier === 'none') return null;

  const config = {
    basic: {
      icon: CheckCircle2,
      label: 'Verified',
      description: 'Basic verification completed',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    government: {
      icon: Shield,
      label: 'Government Verified',
      description: 'Verified with Registrar General',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    premium: {
      icon: Award,
      label: 'Premium Verified',
      description: 'Highest verification level with background checks',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  };

  const { icon: Icon, label, description, color, bgColor } = config[tier];

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const badge = (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-1",
      bgColor,
      className
    )}>
      <Icon className={cn(sizeClasses[size], color)} />
      {showLabel && (
        <span className={cn("text-xs font-medium", color)}>
          {label}
        </span>
      )}
      {trustScore !== undefined && trustScore > 0 && (
        <span className="text-xs font-semibold text-foreground">
          {trustScore}
        </span>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {trustScore !== undefined && trustScore > 0 && (
              <p className="text-xs">
                Trust Score: <span className="font-semibold">{trustScore}/100</span>
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;
