import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SystemSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ["system_settings"],
    queryFn: async (): Promise<SystemSetting[]> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("key");

      if (error) throw error;
      return data as SystemSetting[];
    },
  });
};

export const useSystemSetting = (key: string) => {
  return useQuery({
    queryKey: ["system_settings", key],
    queryFn: async (): Promise<SystemSetting | null> => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("key", key)
        .maybeSingle();

      if (error) throw error;
      return data as SystemSetting | null;
    },
  });
};

export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase
        .from("system_settings")
        .update({ value })
        .eq("key", key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["system_settings"] });
      queryClient.invalidateQueries({ queryKey: ["system_settings", variables.key] });
      toast.success("Nastavení uloženo");
    },
    onError: (error: Error) => {
      toast.error("Chyba při ukládání nastavení", {
        description: error.message,
      });
    },
  });
};
