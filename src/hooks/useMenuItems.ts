import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MenuItem {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  dietary_tags: string[];
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useMenuItems(businessId: string) {
  return useQuery({
    queryKey: ["menu-items", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_menu_items")
        .select("*")
        .eq("business_id", businessId)
        .order("category")
        .order("sort_order");

      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!businessId,
  });
}

export function useMenuItemMutations(businessId: string) {
  const queryClient = useQueryClient();

  const createMenuItem = useMutation({
    mutationFn: async (item: Omit<Partial<MenuItem>, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("business_menu_items")
        .insert({ ...item, business_id: businessId } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", businessId] });
      toast.success("Menu item added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add menu item");
      console.error(error);
    },
  });

  const updateMenuItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenuItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("business_menu_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", businessId] });
      toast.success("Menu item updated");
    },
    onError: (error) => {
      toast.error("Failed to update menu item");
      console.error(error);
    },
  });

  const deleteMenuItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("business_menu_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", businessId] });
      toast.success("Menu item deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete menu item");
      console.error(error);
    },
  });

  return { createMenuItem, updateMenuItem, deleteMenuItem };
}
