import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

type PaymentStatus = "paid" | "partial" | "pending" | "failed" | "refunded";

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string | null | undefined;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<PaymentStatus, { 
  label: string; 
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ElementType;
  className: string;
}> = {
  paid: {
    label: "Paid",
    variant: "default",
    icon: CheckCircle,
    className: "bg-green-500 hover:bg-green-600",
  },
  partial: {
    label: "Partial",
    variant: "secondary",
    icon: Clock,
    className: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  pending: {
    label: "Pending",
    variant: "outline",
    icon: Clock,
    className: "border-amber-500 text-amber-600",
  },
  failed: {
    label: "Failed",
    variant: "destructive",
    icon: XCircle,
    className: "",
  },
  refunded: {
    label: "Refunded",
    variant: "secondary",
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground",
  },
};

export function PaymentStatusBadge({ 
  status, 
  showIcon = true,
  className = "",
}: PaymentStatusBadgeProps) {
  const normalizedStatus = (status?.toLowerCase() || "pending") as PaymentStatus;
  const config = statusConfig[normalizedStatus] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className}`}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
