import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AppRole } from "./useAuth";

interface CreateUserData {
  email: string;
  password: string;
  fullName?: string;
  role?: AppRole;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Nejste přihlášen");
      }

      const response = await supabase.functions.invoke("create-user", {
        body: data,
      });

      if (response.error) {
        throw new Error(response.error.message || "Chyba při vytváření uživatele");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Uživatel vytvořen",
        description: "Nový uživatel byl úspěšně vytvořen.",
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
