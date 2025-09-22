"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAllWorkouts } from "@/hooks/useWorkouts";
import { Workout } from "@/lib/workout";
import WorkoutItem from "@/components/WorkoutItem";

export default function WorkoutFeed({
  ownOnlyByDefault = false,
}: {
  ownOnlyByDefault?: boolean;
}) {
  const { user } = useAuth();
  const [ownOnly] = useState(ownOnlyByDefault);

  // TanStack Query hooks
  const { data: workouts = [], isLoading, error } = useAllWorkouts();
  const [topPerformers, setTopPerformers] = useState<Set<string>>(new Set());

  // Identify top performers based on workout count
  const identifyTopPerformers = useCallback((workouts: Workout[]) => {
    const challengeStart = new Date();
    challengeStart.setDate(challengeStart.getDate() + 1); // Tomorrow
    challengeStart.setHours(0, 0, 0, 0);
    const filtered = workouts.filter((w) => new Date(w.date) >= challengeStart);

    const userCounts: Record<string, number> = {};
    filtered.forEach((workout) => {
      userCounts[workout.user_id] = (userCounts[workout.user_id] || 0) + 1;
    });

    // Get top 3 performers
    const sortedUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([userId]) => userId);

    const newTopPerformers = new Set(sortedUsers);

    // Only update if the set has actually changed
    setTopPerformers((prev) => {
      if (prev.size !== newTopPerformers.size) return newTopPerformers;
      for (const userId of newTopPerformers) {
        if (!prev.has(userId)) return newTopPerformers;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (workouts.length > 0) {
      identifyTopPerformers(workouts);
    }
  }, [workouts, identifyTopPerformers]);

  // Filter workouts based on ownOnly setting
  const filteredWorkouts = ownOnly
    ? workouts.filter((w) => w.user_id === user?.id)
    : workouts;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="w-full backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden bg-white/10 border border-white/20 animate-pulse"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/20 rounded w-32" />
                  <div className="h-3 bg-white/20 rounded w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-white/20 rounded w-48" />
                <div className="h-4 bg-white/20 rounded w-64" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden bg-red-500/10 border border-red-500/20 p-6 text-center">
        <p className="text-red-200">
          Kunne ikke laste treningsøkter. Prøv igjen senere.
        </p>
      </div>
    );
  }

  if (filteredWorkouts.length === 0) {
    return (
      <div className="w-full backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden bg-white/10 border border-white/20 p-6 text-center">
        <p className="text-white/70">
          {ownOnly
            ? "Du har ikke logget noen treningsøkter ennå."
            : "Ingen treningsøkter funnet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredWorkouts.map((workout) => {
        const isTopPerformer = topPerformers.has(workout.user_id);
        const isFirstPlace = Array.from(topPerformers)[0] === workout.user_id;

        return (
          <WorkoutItem
            key={workout.id}
            workout={workout}
            isTopPerformer={isTopPerformer}
            isFirstPlace={isFirstPlace}
          />
        );
      })}
    </div>
  );
}
