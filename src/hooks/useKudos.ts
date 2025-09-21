import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchKudosCount,
  hasUserGivenKudos,
  fetchKudosUsers,
  giveKudos,
  removeKudos,
} from "@/lib/kudos";
import { useAuth } from "@/components/AuthProvider";

// Query keys
export const kudosKeys = {
  all: ["kudos"] as const,
  count: (workoutId: string) => [...kudosKeys.all, "count", workoutId] as const,
  userGiven: (workoutId: string, userId: string) =>
    [...kudosKeys.all, "userGiven", workoutId, userId] as const,
  users: (workoutId: string) => [...kudosKeys.all, "users", workoutId] as const,
};

// Hook to get kudos count for a workout
export function useKudosCount(workoutId: string) {
  return useQuery({
    queryKey: kudosKeys.count(workoutId),
    queryFn: () => fetchKudosCount(workoutId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to check if user has given kudos
export function useHasUserGivenKudos(workoutId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: kudosKeys.userGiven(workoutId, user?.id || ""),
    queryFn: () => hasUserGivenKudos(workoutId, user?.id || ""),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to get kudos users for a workout
export function useKudosUsers(workoutId: string) {
  return useQuery({
    queryKey: kudosKeys.users(workoutId),
    queryFn: () => fetchKudosUsers(workoutId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to give kudos
export function useGiveKudos() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      workoutId,
      userId,
    }: {
      workoutId: string;
      userId: string;
    }) => giveKudos(workoutId, userId),
    onSuccess: (_, { workoutId }) => {
      // Invalidate kudos-related queries for this workout
      queryClient.invalidateQueries({ queryKey: kudosKeys.count(workoutId) });
      queryClient.invalidateQueries({
        queryKey: kudosKeys.userGiven(workoutId, user?.id || ""),
      });
      queryClient.invalidateQueries({ queryKey: kudosKeys.users(workoutId) });
    },
    onError: (error) => {
      console.error("Error giving kudos:", error);
    },
  });
}

// Hook to remove kudos
export function useRemoveKudos() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      workoutId,
      userId,
    }: {
      workoutId: string;
      userId: string;
    }) => removeKudos(workoutId, userId),
    onSuccess: (_, { workoutId }) => {
      // Invalidate kudos-related queries for this workout
      queryClient.invalidateQueries({ queryKey: kudosKeys.count(workoutId) });
      queryClient.invalidateQueries({
        queryKey: kudosKeys.userGiven(workoutId, user?.id || ""),
      });
      queryClient.invalidateQueries({ queryKey: kudosKeys.users(workoutId) });
    },
    onError: (error) => {
      console.error("Error removing kudos:", error);
    },
  });
}
