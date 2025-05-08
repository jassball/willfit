"use client";
import { Navbar } from "@/components";
import { AvatarImage } from "@/components/AvatarImage";
import { fetchAllWorkouts, Workout } from "@/lib/workout";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

// Helper to get start of current challenge (4 weeks ago)
function getChallengeStartDate() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 28); // 4 weeks ago
  return start.toISOString().slice(0, 10);
}

type LeaderboardUser = {
  user_id: string;
  count: number;
  profile: Workout["profile"];
};

export default function StatsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const { user } = useAuth();
  const [isEnlisted, setIsEnlisted] = useState<boolean>(false);
  const [loadingEnlist, setLoadingEnlist] = useState(false);
  const [checkedEnlistment, setCheckedEnlistment] = useState(false);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const workouts = await fetchAllWorkouts(false);
        const challengeStart = getChallengeStartDate();
        // Filter workouts in challenge period
        const filtered = workouts.filter((w) => w.date >= challengeStart);
        // Aggregate by user
        const userMap: Record<string, LeaderboardUser> = {};
        for (const w of filtered) {
          const uid = w.user_id;
          if (!userMap[uid]) {
            userMap[uid] = {
              user_id: uid,
              count: 0,
              profile: w.profile,
            };
          }
          userMap[uid].count++;
        }
        // Convert to array and sort
        const sorted = Object.values(userMap).sort((a, b) => b.count - a.count);
        setLeaderboard(sorted);
      } catch {
        setLeaderboard([]);
      }
    }
    loadLeaderboard();
  }, []);

  useEffect(() => {
    async function fetchEnlistment() {
      if (!user) {
        setCheckedEnlistment(true);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("is_enlisted")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setIsEnlisted(!!data.is_enlisted);
      }
      setCheckedEnlistment(true);
    }
    fetchEnlistment();
  }, [user]);

  async function handleEnlist() {
    if (!user) return;
    setLoadingEnlist(true);
    const { error } = await supabase
      .from("profiles")
      .update({ is_enlisted: true })
      .eq("id", user.id);
    if (!error) setIsEnlisted(true);
    setLoadingEnlist(false);
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black">
      <Navbar />
      <div className="w-full max-w-md mt-10 bg-blue-400 rounded-3xl shadow-lg p-4 relative mx-auto">
        <h1 className="text-xl font-bold text-center mb-6 text-white">
          Vær med i konkurransen!
        </h1>
        {/* Top 3 */}
        <div className="flex justify-center items-end gap-8 mb-4">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, idx) => {
            if (!user) return null; // Skip rendering if user is undefined
            const trueIndex = [1, 0, 2][idx]; // maps back to original index
            return (
              <div
                key={user.user_id}
                className={`flex flex-col items-center ${
                  trueIndex === 0 ? "mb-6" : trueIndex === 1 ? "mb-2" : "mb-1"
                }`}
              >
                {/* 1st is tallest */}
                <div
                  className={`rounded-full border-4 ${
                    trueIndex === 0
                      ? "border-yellow-400"
                      : trueIndex === 1
                      ? "border-blue-200"
                      : "border-orange-400"
                  }`}
                >
                  <AvatarImage size={16} avatarPath={user.profile.avatar_url} />
                </div>
                <span className="text-white font-semibold mt-2">
                  {user.profile.first_name}
                </span>
                <span className="text-xs text-white">{user.count}x</span>
                <div
                  className={`mt-1 w-8 h-8 flex items-center justify-center rounded-t-lg ${
                    trueIndex === 0
                      ? "bg-yellow-400"
                      : trueIndex === 1
                      ? "bg-blue-200"
                      : "bg-blue-300"
                  }`}
                >
                  {trueIndex + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl p-2 shadow-md">
          {leaderboard.slice(3).map((user, idx) => (
            <div
              key={user.user_id}
              className="flex items-center py-2 px-2 border-b last:border-b-0"
            >
              <span className="w-6 text-black 0">{idx + 4}</span>
              <AvatarImage avatarPath={user.profile.avatar_url} />
              <span className="ml-2 flex-1 text-black">
                {user.profile.first_name}
              </span>
              <span className="text-black">{user.count}x</span>
            </div>
          ))}
        </div>
        {/* Only show the button if enlistment check is done and user is not enlisted */}
        {checkedEnlistment && !isEnlisted && (
          <button
            className="w-full mt-6 bg-blue-500 text-white py-3 rounded-full font-semibold text-lg disabled:opacity-60"
            onClick={handleEnlist}
            disabled={loadingEnlist}
          >
            {loadingEnlist ? "Enlisting..." : "Enter Contest"}
          </button>
        )}
      </div>
    </div>
  );
}
