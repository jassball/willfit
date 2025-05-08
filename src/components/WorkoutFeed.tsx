"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import WorkoutInfoBox from "@/components/WorkoutInfoBox";
import CommentSection from "@/components/CommentSection";
import { CommentPopover } from "@/components/CommentPopover";

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

  const [openCommentWorkoutId, setOpenCommentWorkoutId] = useState<
    string | null
  >(null);

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

  const toggleCommentSection = (workoutId: string) => {
    setOpenCommentWorkoutId(workoutId);
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
          if (!kudos) return null;
          return (
            <div
              key={w.id}
              className="relative w-screen h-[80vh] rounded-none overflow-visible shadow-lg mb-24 sm:rounded-xl sm:max-w-md sm:mx-auto"
            >
              {/* Slett-knapp */}
              {user?.id === w.user_id && (
                <button
                  onClick={() => handleDelete(w.id)}
                  className="absolute top-4 right-4 text-white text-2xl"
                  title="Slett"
                >
                  ⋯
                </button>
              )}

              {/* Bakgrunnsbilde */}
              <div className="w-full h-full overflow-hidden rounded-none sm:rounded-xl">
                <img
                  src={w.image_url || "/default-image.jpg"}
                  alt="Treningsbilde"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Øverst: Brukerinfo med bakgrunnsboks */}
              <div className="absolute top-4 left-4 bg-[rgba(1,0,0,0.44)] rounded-full px-3 py-2 flex items-center gap-2 text-white shadow-md">
                <img
                  src={w.profile.avatar_url || "/avatar-modified.ico"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="leading-tight">
                  <p className="text-sm font-semibold">
                    {w.profile.first_name} {w.profile.last_name}
                  </p>
                  <p className="text-xs">@{w.profile.username}</p>
                </div>
              </div>

              {/* Nederst: Overlay med metadata og handlinger */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-11/12 max-w-md">
                <WorkoutInfoBox
                  date={w.date}
                  type={w.type}
                  note={w.note}
                  kudosCount={kudos.kudosCount}
                  hasGivenKudos={kudos.hasGivenKudos}
                  onToggleKudos={() => toggleKudosForWorkout(w.id)}
                  onCommentClick={() => toggleCommentSection(w.id)}
                />
                {/* Show comments below WorkoutInfoBox */}
                <div className="mt-2">
                  <CommentSection
                    workoutId={w.id}
                    currentUserId={user?.id || ""}
                    workoutOwnerId={w.user_id}
                    avatar_url={w.profile.avatar_url || "/avatar-modified.ico"}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Modal for adding new comments */}
      {openCommentWorkoutId && (
        <CommentPopover onClose={() => setOpenCommentWorkoutId(null)}>
          <CommentSection
            workoutId={openCommentWorkoutId}
            currentUserId={user?.id || ""}
            workoutOwnerId={
              workouts.find((w) => w.id === openCommentWorkoutId)?.user_id || ""
            }
            avatar_url={
              workouts.find((w) => w.id === openCommentWorkoutId)?.profile
                .avatar_url || "/avatar-modified.ico"
            }
            readOnly={false}
          />
        </CommentPopover>
      )}
    </div>
  );
}
