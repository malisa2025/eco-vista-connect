import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PaystackKeyResponse {
  publicKey: string;
}

export function usePaystackPublicKey() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["paystack-public-key"],
    queryFn: async (): Promise<string> => {
      const { data, error } = await supabase.functions.invoke<PaystackKeyResponse>(
        "get-paystack-public-key"
      );

      if (error) {
        console.error("Failed to fetch Paystack public key:", error);
        throw error;
      }

      if (!data?.publicKey) {
        throw new Error("Paystack public key not found");
      }

      return data.publicKey;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - public key rarely changes
    gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    publicKey: data || "",
    isLoading,
    error,
    isConfigured: Boolean(data),
  };
}
