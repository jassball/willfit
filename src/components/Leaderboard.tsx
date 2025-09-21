"use client";

import { useEffect, useState } from "react";
import { AvatarImage } from "@/components/AvatarImage";
import { fetchAllWorkouts, Workout } from "@/lib/workout";
import { useAuth } from "@/components/AuthProvider";
import { Share2, Trophy, Flame, Crown, Medal, Zap } from "lucide-react";

type LeaderboardUser = {
  user_id: string;
  count: number;
  streak: number;
  profile: Workout["profile"];
  rank: number;
  previousRank?: number;
  isCurrentUser?: boolean;
};

type LeaderboardProps = {
  compact?: boolean;
  showStreaks?: boolean;
  maxItems?: number;
  className?: string;
};

export default function Leaderboard({
  compact = false,
  showStreaks = true,
  maxItems = 10,
  className = "",
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousLeaderboard, setPreviousLeaderboard] = useState<
    LeaderboardUser[]
  >([]);
  const { user } = useAuth();

  // Calculate streaks and leaderboard
  const calculateStreaks = (workouts: Workout[]) => {
    const userStreaks: Record<string, number> = {};
    const userWorkouts: Record<string, Workout[]> = {};

    // Group workouts by user
    workouts.forEach((workout) => {
      if (!userWorkouts[workout.user_id]) {
        userWorkouts[workout.user_id] = [];
      }
      userWorkouts[workout.user_id].push(workout);
    });

    // Calculate streaks for each user
    Object.entries(userWorkouts).forEach(([userId, userWorkoutList]) => {
      const sortedWorkouts = userWorkoutList.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      let currentStreak = 0;
      let currentDate = new Date();

      // Check consecutive days
      for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date);
        const daysDiff = Math.floor(
          (currentDate.getTime() - workoutDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysDiff === currentStreak) {
          currentStreak++;
          currentDate = new Date(workoutDate);
        } else if (daysDiff === currentStreak + 1) {
          currentStreak++;
          currentDate = new Date(workoutDate);
        } else {
          break;
        }
      }

      userStreaks[userId] = currentStreak;
    });

    return userStreaks;
  };

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        const workouts = await fetchAllWorkouts(false);
        const challengeStart = new Date();
        challengeStart.setDate(challengeStart.getDate() + 1); // Tomorrow
        challengeStart.setHours(0, 0, 0, 0);

        const filtered = workouts.filter(
          (w) => new Date(w.date) >= challengeStart
        );

        const streaks = calculateStreaks(filtered);
        const userMap: Record<string, LeaderboardUser> = {};

        for (const w of filtered) {
          const uid = w.user_id;
          if (!userMap[uid]) {
            userMap[uid] = {
              user_id: uid,
              count: 0,
              streak: streaks[uid] || 0,
              profile: w.profile,
              rank: 0,
              isCurrentUser: user?.id === uid,
            };
          }
          userMap[uid].count++;
        }

        const sorted = Object.values(userMap)
          .sort((a, b) => b.count - a.count)
          .map((user, index) => ({
            ...user,
            rank: index + 1,
          }))
          .slice(0, maxItems);

        // Store previous leaderboard for animations
        setPreviousLeaderboard(leaderboard);
        setLeaderboard(sorted);
      } catch (error) {
        console.error("Feil under lasting av leaderboard:", error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [user?.id, maxItems]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-white/60 font-bold text-sm">#{rank}</span>;
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "text-orange-400";
    if (streak >= 3) return "text-yellow-400";
    return "text-white/60";
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Willfit Leaderboard",
          text: "Sjekk ut Willfit leaderboard!",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert("Link kopiert til utklippstavle!");
    }
  };

  if (loading) {
    return (
      <div
        className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 ${className}`}
      >
        <div className="space-y-4">
          {[...Array(compact ? 3 : 5)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-4 animate-pulse"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/20 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
              <div className="w-12 h-6 bg-white/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">
              {compact ? "Topp 3" : "Leaderboard"}
            </h2>
          </div>
          {!compact && (
            <button
              onClick={handleShare}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-4 space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">Ingen data ennå</p>
          </div>
        ) : (
          leaderboard.map((user, idx) => {
            const isTopThree = user.rank <= 3;
            const hasMovedUp =
              previousLeaderboard.find((p) => p.user_id === user.user_id)
                ?.rank &&
              previousLeaderboard.find((p) => p.user_id === user.user_id)!
                .rank > user.rank;
            const hasMovedDown =
              previousLeaderboard.find((p) => p.user_id === user.user_id)
                ?.rank &&
              previousLeaderboard.find((p) => p.user_id === user.user_id)!
                .rank < user.rank;

            return (
              <div
                key={user.user_id}
                className={`relative p-4 rounded-2xl transition-all duration-500 ${
                  isTopThree
                    ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
                    : "bg-white/5 hover:bg-white/10"
                } ${
                  hasMovedUp
                    ? "animate-bounce"
                    : hasMovedDown
                    ? "animate-pulse"
                    : ""
                }`}
              >
                {/* Glow effect for top 3 */}
                {isTopThree && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl animate-pulse" />
                )}

                <div className="relative flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <AvatarImage
                      avatarPath={user.profile.avatar_url}
                      size={compact ? 10 : 12}
                    />
                    {isTopThree && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Crown className="w-2 h-2 text-yellow-900" />
                      </div>
                    )}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold truncate ${
                          isTopThree ? "text-yellow-100" : "text-white"
                        }`}
                      >
                        {user.profile.first_name}
                      </h3>
                      {user.isCurrentUser && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          Du
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 truncate">
                      @{user.profile.username || "bruker"}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3">
                    {showStreaks && user.streak > 0 && (
                      <div className="flex items-center gap-1">
                        <Flame
                          className={`w-4 h-4 ${getStreakColor(user.streak)}`}
                        />
                        <span
                          className={`text-sm font-bold ${getStreakColor(
                            user.streak
                          )}`}
                        >
                          {user.streak}
                        </span>
                      </div>
                    )}

                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          isTopThree ? "text-yellow-200" : "text-white"
                        }`}
                      >
                        {user.count}x
                      </div>
                      {hasMovedUp && (
                        <div className="flex items-center gap-1 text-green-400 text-xs">
                          <Zap className="w-3 h-3" />
                          <span>Opp!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer for compact view */}
      {compact && leaderboard.length > 3 && (
        <div className="p-4 border-t border-white/10 text-center">
          <button className="text-white/60 hover:text-white text-sm transition-colors">
            Se full leaderboard →
          </button>
        </div>
      )}
    </div>
  );
}
