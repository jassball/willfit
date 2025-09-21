import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

// Query keys
export const profileKeys = {
  all: ["profiles"] as const,
  current: () => [...profileKeys.all, "current"] as const,
  user: (userId: string) => [...profileKeys.all, "user", userId] as const,
};

// Types
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Hook to fetch current user's profile
export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      // Invalidate current profile
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
    },
  });
}

// Hook to check if user is enlisted in competition
export function useEnlistmentStatus() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enlistment", user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from("enlistments")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return !!data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to enlist in competition
export function useEnlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("enlistments")
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate enlistment status
      queryClient.invalidateQueries({ queryKey: ["enlistment", user?.id] });
    },
    onError: (error) => {
      console.error("Error enlisting:", error);
    },
  });
}
