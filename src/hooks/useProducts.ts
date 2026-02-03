import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductInsert, ProductUpdate } from "@/types/product";
import { toast } from "@/hooks/use-toast";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as Product[];
    },
  });
};

export const useFavoriteProducts = () => {
  return useQuery({
    queryKey: ["products", "favorites"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_favorite", true)
        .order("sort_order", { ascending: true })
        .limit(10);

      if (error) {
        throw new Error(error.message);
      }

      return data as Product[];
    },
  });
};

export const useNonFavoriteProducts = () => {
  return useQuery({
    queryKey: ["products", "non-favorites"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_favorite", false)
        .order("sort_order", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as Product[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Produkt vytvořen",
        description: "Nový produkt byl úspěšně přidán.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Produkt aktualizován",
        description: "Změny byly úspěšně uloženy.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Produkt smazán",
        description: "Produkt byl úspěšně odstraněn.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
