import { useAuth } from "@/contexts/AuthContext";
import { usePaystackPublicKey } from "@/hooks/usePaystackPublicKey";
import { PAYSTACK_CURRENCY, generatePaymentReference, toPesewas, type PaymentType } from "@/lib/paystack";

interface UsePaystackConfigOptions {
  amount: number; // in GHS
  type: PaymentType;
  email?: string; // Optional email for guest checkout
  entityId?: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: any) => void;
  onClose?: () => void;
}

export function usePaystackConfig({
  amount,
  type,
  email,
  entityId,
  metadata,
  onSuccess,
  onClose,
}: UsePaystackConfigOptions) {
  const { user } = useAuth();
  const { publicKey, isLoading: isLoadingKey, isConfigured } = usePaystackPublicKey();

  // Use provided email first, then fall back to authenticated user's email
  const resolvedEmail = email || user?.email || "";

  const config = {
    email: resolvedEmail,
    amount: toPesewas(amount),
    currency: PAYSTACK_CURRENCY,
    publicKey,
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

  // Ready when: email available, public key loaded, and amount > 0
  const isReady = Boolean(resolvedEmail && isConfigured && publicKey && amount > 0 && !isLoadingKey);

  return {
    config,
    isReady,
    publicKey,
    isLoadingKey,
  };
}
