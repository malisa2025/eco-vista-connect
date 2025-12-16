import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { useState } from "react";
import { usePaystackConfig } from "@/hooks/usePaystackConfig";
import { isPaystackConfigured, type PaymentType } from "@/lib/paystack";
import { toast } from "sonner";

interface PaymentButtonProps {
  amount: number; // in GHS
  email?: string;
  type: PaymentType;
  entityId?: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: any) => void | Promise<void>;
  onClose?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function PaymentButton({
  amount,
  email,
  type,
  entityId,
  metadata,
  onSuccess,
  onClose,
  disabled,
  className,
  children,
  variant = "default",
  size = "default",
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      await onSuccess(reference);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsProcessing(false);
    onClose?.();
  };

  const { config, isReady } = usePaystackConfig({
    amount,
    type,
    entityId,
    metadata: { ...metadata, email },
    onSuccess: handleSuccess,
    onClose: handleClose,
  });

  // Override email if provided directly
  const finalConfig = email ? { ...config, email } : config;

  const initializePayment = usePaystackPayment(finalConfig);

  const handleClick = () => {
    if (!isPaystackConfigured()) {
      toast.error("Payment system is not configured. Please contact support.");
      return;
    }
    
    if (!finalConfig.email) {
      toast.error("Please provide an email address");
      return;
    }

    setIsProcessing(true);
    initializePayment({
      onSuccess: handleSuccess,
      onClose: handleClose,
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isProcessing || !isReady}
      className={className}
      variant={variant}
      size={size}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay GH₵{amount.toFixed(2)}
          </>
        )
      )}
    </Button>
  );
}
