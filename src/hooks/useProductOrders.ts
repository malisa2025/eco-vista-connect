import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductOrder {
  id: string;
  product_id: string;
  business_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  payment_reference: string | null;
  payment_status: string;
  paid_at: string | null;
  shipping_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    image_url: string | null;
  };
}

export const useBusinessOrders = (businessId: string) => {
  return useQuery({
    queryKey: ["business-orders", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_orders")
        .select(`
          *,
          product:business_products(name, image_url)
        `)
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductOrder[];
    },
    enabled: !!businessId,
  });
};

export const useOrderMutations = (businessId: string) => {
  const queryClient = useQueryClient();

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from("product_orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-orders", businessId] });
      toast.success("Order status updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update order: " + error.message);
    },
  });

  return { updateOrderStatus };
};

export const useMyOrders = (email: string) => {
  return useQuery({
    queryKey: ["my-orders", email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_orders")
        .select(`
          *,
          product:business_products(name, image_url)
        `)
        .eq("buyer_email", email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductOrder[];
    },
    enabled: !!email,
  });
};
