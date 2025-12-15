import { useAuth } from "@/contexts/AuthContext";
import { PAYSTACK_PUBLIC_KEY, generatePaymentReference, toPesewas, type PaymentType } from "@/lib/paystack";

interface UsePaystackConfigOptions {
  amount: number; // in GHS
  type: PaymentType;
  entityId?: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: any) => void;
  onClose?: () => void;
}

export function usePaystackConfig({
  amount,
  type,
  entityId,
  metadata,
  onSuccess,
  onClose,
}: UsePaystackConfigOptions) {
  const { user } = useAuth();

  const config = {
    email: user?.email || "",
    amount: toPesewas(amount),
    publicKey: PAYSTACK_PUBLIC_KEY,
    reference: generatePaymentReference(type, entityId),
    metadata: {
      user_id: user?.id,
      payment_type: type,
      entity_id: entityId,
      ...metadata,
      custom_fields: [
        {
          display_name: "Payment Type",
          variable_name: "payment_type",
          value: type,
        },
        ...(metadata?.custom_fields || []),
      ],
    },
    onSuccess,
    onClose: onClose || (() => {}),
  };

  const isReady = Boolean(user?.email && PAYSTACK_PUBLIC_KEY && amount > 0);

  return {
    config,
    isReady,
    publicKey: PAYSTACK_PUBLIC_KEY,
  };
}
