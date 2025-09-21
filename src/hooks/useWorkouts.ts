import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllWorkouts,
  createWorkout,
  deleteWorkout,
  Workout,
} from "@/lib/workout";
import { useAuth } from "@/components/AuthProvider";

// Query keys
export const workoutKeys = {
  all: ["workouts"] as const,
  lists: () => [...workoutKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...workoutKeys.lists(), { filters }] as const,
  details: () => [...workoutKeys.all, "detail"] as const,
  detail: (id: string) => [...workoutKeys.details(), id] as const,
};

// Hook to fetch workouts with pagination
export function useWorkouts(page = 0, limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: workoutKeys.list({ page, limit, userId: user?.id }),
    queryFn: () => fetchAllWorkouts(false, user?.id),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to fetch all workouts (for leaderboard, etc.)
export function useAllWorkouts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: workoutKeys.list({ all: true, userId: user?.id }),
    queryFn: () => fetchAllWorkouts(false),
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hook to create a workout
export function useCreateWorkout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      // Invalidate and refetch workouts
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
    onError: (error) => {
      console.error("Error creating workout:", error);
    },
  });
}

// Hook to delete a workout
export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      // Invalidate and refetch workouts
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
    onError: (error) => {
      console.error("Error deleting workout:", error);
    },
  });
}
