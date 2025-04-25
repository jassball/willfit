"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import KudosButton from "./KudosButton";

import {
  fetchAllWorkouts,
  fetchLatestWorkoutCreatedAt,
  deleteWorkout,
  Workout,
} from "@/lib/workout";

import {
  fetchKudosCount,
  hasUserGivenKudos,
  fetchKudosUsers,
  giveKudos,
  removeKudos,
} from "@/lib/kudos";

export default function WorkoutFeed({
  ownOnlyByDefault = false,
}: {
  ownOnlyByDefault?: boolean;
}) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [ownOnly] = useState(ownOnlyByDefault);
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<Workout[]>([]);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  // ⭐️ NYTT: kudos-state per workout-id
  const [kudosState, setKudosState] = useState<
    Record<
      string,
      {
        hasGivenKudos: boolean;
        kudosCount: number;
        kudosUsers: { user_id: string; username?: string }[];
      }
    >
  >({});

  const fetchKudosDataForWorkout = async (workoutId: string) => {
    const [count, hasGiven, users] = await Promise.all([
      fetchKudosCount(workoutId),
      hasUserGivenKudos(workoutId, user?.id || ""),
      fetchKudosUsers(workoutId),
    ]);

    setKudosState((prev) => ({
      ...prev,
      [workoutId]: {
        hasGivenKudos: hasGiven,
        kudosCount: count,
        kudosUsers: users.map((user) => ({
          ...user,
          username: user.username ?? undefined,
        })),
      },
    }));
  };

  const toggleKudosForWorkout = async (workoutId: string) => {
    const current = kudosState[workoutId];
    if (!current) return;

    if (current.hasGivenKudos) {
      await removeKudos(workoutId, user?.id || "");
    } else {
      await giveKudos(workoutId, user?.id || "");
    }
    await fetchKudosDataForWorkout(workoutId); // 🔄 Oppdater state for begge komponentene
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Er du sikker på at du vil slette denne økten?");
    if (!confirmed) return;

    try {
      await deleteWorkout(id);
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch {
      alert("Kunne ikke slette økten.");
    }
  };

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);

      try {
        const latestCreated = await fetchLatestWorkoutCreatedAt(
          ownOnly,
          user?.id
        );

        if (lastFetched === latestCreated && cache.length > 0) {
          setWorkouts(cache);
          setLoading(false);
          return;
        }

        const workouts = await fetchAllWorkouts(ownOnly, user?.id);
        setWorkouts(workouts);
        setCache(workouts);
        setLastFetched(latestCreated);

        // 🟢 Hent kudos-data for alle workouts
        workouts.forEach((w) => {
          fetchKudosDataForWorkout(w.id);
        });
      } catch {
        alert("Kunne ikke hente treningsøkter.");
      }

      setLoading(false);
    };

    fetchWorkouts();
  }, [ownOnly, user, lastFetched, cache]);

  if (loading) return <p>Laster treningsøkter...</p>;

  return (
    <div className="flex flex-col items-center justify-center">
      {workouts.length === 0 ? (
        <p className="text-white">Ingen treningsøkter funnet.</p>
      ) : (
        workouts.map((w) => {
          const kudos = kudosState[w.id];
          return (
            <div
              key={w.id}
              className="relative rounded-xl bg-black text-white shadow-xl mb-6 p-4 space-y-2 border-white md:w-5/12 md:h-5/12"
            >
              {user?.id === w.user_id && (
                <div className="absolute top-2 right-2 text-white">
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-white text-xl"
                    title="Slett"
                  >
                    ⋯
                  </button>
                </div>
              )}

              {/* Brukerinfo */}
              <div className="flex items-center gap-3">
                <img
                  src={w.profile.avatar_url || "/avatar-modified.ico"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border"
                />
                <div>
                  <p className="font-semibold">
                    {w.profile.first_name} {w.profile.last_name}
                  </p>
                  <p className="text-sm text-gray-400">@{w.profile.username}</p>
                </div>
              </div>

              {/* Treningsbilde */}
              {w.image_url && kudos && (
                <KudosButton
                  workoutId={w.id}
                  userId={user?.id || ""}
                  isButton={false}
                  hasGivenKudos={kudos.hasGivenKudos}
                  kudosCount={kudos.kudosCount}
                  kudosUsers={kudos.kudosUsers}
                  toggleKudos={() => toggleKudosForWorkout(w.id)}
                >
                  <img
                    src={w.image_url}
                    alt="treningsbilde"
                    className="w-full rounded-lg "
                  />
                </KudosButton>
              )}

              {/* Metadata */}
              <div className="text-sm text-gray-400">
                {new Date(w.date).toLocaleDateString("nb-NO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              {/* Tittel / PR / Notat */}
              <div className=" items-center gap-2">
                <p className="text-gray-400 text-sm">Økt:</p>
                <h3 className="text-lg font-bold"> {w.type}</h3>
              </div>

              {w.pr && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  PR!
                </span>
              )}
              {w.note && (
                <div className=" items-center gap-2">
                  <p className="text-gray-400 text-xs">Notat:</p>
                  <p>{w.note}</p>
                </div>
              )}

              {/* Interaksjon */}
              {kudos && (
                <div className="flex gap-4 items-center pt-2 text-gray-300">
                  <KudosButton
                    workoutId={w.id}
                    userId={user?.id || ""}
                    isButton={true}
                    hasGivenKudos={kudos.hasGivenKudos}
                    kudosCount={kudos.kudosCount}
                    kudosUsers={kudos.kudosUsers}
                    toggleKudos={() => toggleKudosForWorkout(w.id)}
                  />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
