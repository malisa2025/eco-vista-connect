import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessStatus } from '@/hooks/useBusinessStatus';

interface BusinessHoursStatusProps {
  businessId: string;
  showLabel?: boolean;
  className?: string;
}

const BusinessHoursStatus = ({
  businessId,
  showLabel = true,
  className
}: BusinessHoursStatusProps) => {
  const { data: status, isLoading } = useBusinessStatus(businessId);

  if (isLoading || status?.isOpen === null) return null;

  const isOpen = status?.isOpen;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
      isOpen 
        ? "bg-green-500/10 text-green-600 dark:text-green-400" 
        : "bg-red-500/10 text-red-600 dark:text-red-400",
      className
    )}>
      <div className="relative flex items-center justify-center">
        <div className={cn(
          "absolute h-3 w-3 rounded-full opacity-75 animate-ping",
          isOpen ? "bg-green-500" : "bg-red-500"
        )} />
        <div className={cn(
          "relative h-2 w-2 rounded-full",
          isOpen ? "bg-green-500" : "bg-red-500"
        )} />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold">
          {isOpen ? 'Open Now' : 'Closed'}
        </span>
      )}
    </div>
  );
};

export const BusinessHoursDisplay = ({ 
  businessHours,
  className 
}: { 
  businessHours: any;
  className?: string;
}) => {
  if (!businessHours) return null;

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Clock className="h-4 w-4" />
        <span>Business Hours</span>
      </div>
      <div className="space-y-1">
        {daysOrder.map(day => {
          const hours = businessHours[day];
          if (!hours) return null;

          const isClosed = hours.closed === true;

          return (
            <div key={day} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{day}</span>
              <span className={cn(
                "font-medium",
                isClosed && "text-muted-foreground"
              )}>
                {isClosed ? 'Closed' : `${hours.open} - ${hours.close}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessHoursStatus;
