import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BusinessProduct {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  in_stock: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useBusinessProducts(businessId: string) {
  return useQuery({
    queryKey: ["business-products", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_products")
        .select("*")
        .eq("business_id", businessId)
        .order("category")
        .order("sort_order");

      if (error) throw error;
      return data as BusinessProduct[];
    },
    enabled: !!businessId,
  });
}

export function useBusinessProductMutations(businessId: string) {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (product: Omit<Partial<BusinessProduct>, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("business_products")
        .insert({ ...product, business_id: businessId } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-products", businessId] });
      toast.success("Product added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add product");
      console.error(error);
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BusinessProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from("business_products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-products", businessId] });
      toast.success("Product updated");
    },
    onError: (error) => {
      toast.error("Failed to update product");
      console.error(error);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("business_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-products", businessId] });
      toast.success("Product deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete product");
      console.error(error);
    },
  });

  return { createProduct, updateProduct, deleteProduct };
}
