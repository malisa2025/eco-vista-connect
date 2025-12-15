// Paystack payment utilities

export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

export type PaymentType = "hotel_booking" | "advertisement" | "business_subscription" | "job_seeker_subscription";

/**
 * Generate a unique payment reference with a type prefix
 */
export function generatePaymentReference(type: PaymentType, entityId?: string): string {
  const prefixes: Record<PaymentType, string> = {
    hotel_booking: "HTL",
    advertisement: "AD",
    business_subscription: "BSUB",
    job_seeker_subscription: "JSUB",
  };

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const idPart = entityId ? `_${entityId.substring(0, 8)}` : "";

  return `${prefixes[type]}${idPart}_${timestamp}_${randomStr}`;
}

/**
 * Convert amount to pesewas (Paystack uses pesewas for GHS)
 */
export function toPesewas(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert pesewas to GHS
 */
export function toGHS(pesewas: number): number {
  return pesewas / 100;
}

/**
 * Format amount for display
 */
export function formatCurrency(amount: number): string {
  return `GH₵${amount.toFixed(2)}`;
}

/**
 * Standard Paystack config builder
 */
export function buildPaystackConfig({
  email,
  amount,
  reference,
  metadata,
  onSuccess,
  onClose,
}: {
  email: string;
  amount: number; // in GHS
  reference?: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}) {
  return {
    email,
    amount: toPesewas(amount),
    publicKey: PAYSTACK_PUBLIC_KEY,
    reference: reference || generatePaymentReference("hotel_booking"),
    metadata: {
      ...metadata,
      custom_fields: metadata?.custom_fields || [],
    },
    onSuccess,
    onClose,
  };
}

/**
 * Validate that Paystack public key is configured
 */
export function isPaystackConfigured(): boolean {
  return Boolean(PAYSTACK_PUBLIC_KEY && PAYSTACK_PUBLIC_KEY !== "");
}
