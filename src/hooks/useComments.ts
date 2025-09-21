import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

// Query keys
export const commentKeys = {
  all: ["comments"] as const,
  workout: (workoutId: string) =>
    [...commentKeys.all, "workout", workoutId] as const,
};

// Types
export interface Comment {
  id: string;
  workout_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: {
    first_name: string;
    last_name: string;
    username: string;
    avatar_url: string | null;
  };
}

// Hook to fetch comments for a workout
export function useComments(workoutId: string) {
  return useQuery({
    queryKey: commentKeys.workout(workoutId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          workout_id,
          user_id,
          content,
          created_at,
          profile:profiles!comments_user_id_fkey (
            first_name,
            last_name,
            username,
            avatar_url
          )
        `
        )
        .eq("workout_id", workoutId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Comment[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to add a comment
export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      workoutId,
      content,
    }: {
      workoutId: string;
      content: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            workout_id: workoutId,
            user_id: user.id,
            content: content.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { workoutId }) => {
      // Invalidate comments for this workout
      queryClient.invalidateQueries({
        queryKey: commentKeys.workout(workoutId),
      });
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
    },
  });
}

// Hook to delete a comment
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: (_, commentId) => {
      // Invalidate all comment queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
    },
  });
}
