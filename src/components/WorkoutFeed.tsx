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

import { supabase } from "@/lib/supabaseClient";

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 5;

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

  const [commentsState, setCommentsState] = useState<Record<string, boolean>>(
    {}
  );

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

  const checkForComments = async (workoutId: string) => {
    const { data, error } = await supabase
      .from("comments")
      .select("id")
      .eq("workout_id", workoutId)
      .limit(1);

    if (error) {
      console.error("Error checking comments:", error);
      return false;
    }

    const hasComments = data && data.length > 0;
    setCommentsState((prev) => ({
      ...prev,
      [workoutId]: hasComments,
    }));
    return hasComments;
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

        const allWorkouts = await fetchAllWorkouts(ownOnly, user?.id);

        // Remove duplicates based on workout ID
        const uniqueWorkouts = allWorkouts.reduce((acc, current) => {
          const exists = acc.find((item) => item.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, [] as Workout[]);

        setCache(uniqueWorkouts);
        setLastFetched(latestCreated);

        // Get first page of workouts
        const firstPageWorkouts = uniqueWorkouts.slice(0, POSTS_PER_PAGE);
        setWorkouts(firstPageWorkouts);
        setHasMore(uniqueWorkouts.length > POSTS_PER_PAGE);

        // Fetch kudos data for first page
        firstPageWorkouts.forEach((w) => {
          fetchKudosDataForWorkout(w.id);
        });
      } catch {
        alert("Kunne ikke hente treningsøkter.");
      }

      setLoading(false);
    };

    fetchWorkouts();
  }, [ownOnly, user, lastFetched, cache]);

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user has scrolled to 80% of the page
      if (scrollPosition >= documentHeight * 0.8) {
        loadMoreWorkouts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page]);

  const loadMoreWorkouts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;

    const nextWorkouts = cache.slice(startIndex, endIndex);

    if (nextWorkouts.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    // Ensure we don't add duplicates when loading more
    setWorkouts((prev) => {
      const existingIds = new Set(prev.map((w) => w.id));
      const newWorkouts = nextWorkouts.filter((w) => !existingIds.has(w.id));
      return [...prev, ...newWorkouts];
    });

    setPage(nextPage);

    // Fetch kudos data for new workouts
    nextWorkouts.forEach((w) => {
      fetchKudosDataForWorkout(w.id);
    });

    setLoading(false);
  };

  useEffect(() => {
    workouts.forEach((workout) => {
      checkForComments(workout.id);
    });
  }, [workouts]);

  if (loading && workouts.length === 0) return <p>Laster treningsøkter...</p>;

  return (
    <div className="flex flex-col items-center justify-center">
      {workouts.length === 0 ? (
        <p className="text-white">Ingen treningsøkter funnet.</p>
      ) : (
        workouts.map((w) => {
          const kudos = kudosState[w.id];
          if (!kudos) return null;

          if (w.image_url) {
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
                    src={w.image_url || "/default-image.png"}
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
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-11/12 max-w-md">
                  <WorkoutInfoBox
                    date={w.date}
                    type={w.type}
                    note={w.note}
                    kudosCount={kudos.kudosCount}
                    hasGivenKudos={kudos.hasGivenKudos}
                    onToggleKudos={() => toggleKudosForWorkout(w.id)}
                    onCommentClick={() => toggleCommentSection(w.id)}
                  ></WorkoutInfoBox>
                  {/* Show comments below WorkoutInfoBox */}
                  <div className="mt-2">
                    <CommentSection
                      workoutId={w.id}
                      currentUserId={user?.id || ""}
                      workoutOwnerId={w.user_id}
                      avatar_url={
                        w.profile.avatar_url || "/avatar-modified.ico"
                      }
                      readOnly={true}
                      visible={commentsState[w.id] || false}
                    />
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={w.id}
                className="w-full h-full flex flex-col bg-gray-800 "
              >
                {/* Øverst: Brukerinfo med bakgrunnsboks */}
                <div className=" bg-[rgba(1,0,0,0.44)] flex items-center gap-2 text-white shadow-md p-4">
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
                <WorkoutInfoBox
                  date={w.date}
                  type={w.type}
                  note={w.note}
                  kudosCount={kudos.kudosCount}
                  hasGivenKudos={kudos.hasGivenKudos}
                  onToggleKudos={() => toggleKudosForWorkout(w.id)}
                  onCommentClick={() => toggleCommentSection(w.id)}
                  noImage={true}
                />

                {/* Show comments below WorkoutInfoBox */}

                <div className="">
                  <CommentSection
                    workoutId={w.id}
                    currentUserId={user?.id || ""}
                    workoutOwnerId={w.user_id}
                    avatar_url={w.profile.avatar_url || "/avatar-modified.ico"}
                    readOnly={true}
                    visible={commentsState[w.id] || false}
                  />
                </div>
              </div>
            );
          }
        })
      )}

      {loading && workouts.length > 0 && (
        <p className="text-white my-4">Laster flere økter...</p>
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
