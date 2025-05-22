"use client";
import { Navbar } from "@/components";
import { AvatarImage } from "@/components/AvatarImage";
import { fetchAllWorkouts, Workout } from "@/lib/workout";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import ContestCountdown from "@/components/ContestCountdown";

function getChallengeStartDate() {
  return "2025-05-23";
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
        const challengeStart = new Date(getChallengeStartDate());

        const filtered = workouts.filter(
          (w) => new Date(w.date) >= challengeStart
        );

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

        const sorted = Object.values(userMap).sort((a, b) => b.count - a.count);
        setLeaderboard(sorted);
      } catch (error) {
        console.error("Feil under lasting av leaderboard:", error);
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
      <div className="w-full max-w-md mt-10 bg-gray-900 rounded-3xl shadow-lg p-4 relative mx-auto">
        <ContestCountdown
          isEnlisted={isEnlisted}
          handleEnlist={handleEnlist}
          loadingEnlist={loadingEnlist}
          checkedEnlistment={checkedEnlistment}
        />

        <h1 className="text-xl font-bold text-center mb-6 text-white mt-8">
          Leaderboard
        </h1>

        <div className="bg-gray-900 rounded-2xl p-2 shadow-md">
          {leaderboard.length === 0
            ? [...Array(10)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center py-3 px-3 border-b border-gray-800 last:border-b-0 animate-pulse"
                >
                  <div className="w-6 text-gray-500">{idx + 1}</div>
                  <div className="w-10 h-10 bg-gray-700 rounded-full" />
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-800 rounded w-16" />
                  </div>
                  <div className="w-8 h-4 bg-gray-700 rounded ml-auto" />
                </div>
              ))
            : leaderboard.map((user, idx) => {
                const isFirst = idx === 0;
                return (
                  <div
                    key={user.user_id}
                    className={`flex items-center ${
                      isFirst
                        ? "py-4 px-4 bg-gray-800 rounded-xl mb-2"
                        : "py-3 px-3"
                    } border-b border-gray-800 last:border-b-0 hover:bg-gray-800 transition`}
                  >
                    <div
                      className={`w-6 text-gray-400 ${
                        isFirst ? "text-lg font-bold" : ""
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <AvatarImage
                      avatarPath={user.profile.avatar_url}
                      size={isFirst ? 16 : 10}
                    />
                    <div className="ml-3 flex-1">
                      <div
                        className={`text-white ${
                          isFirst ? "text-lg font-semibold" : "font-medium"
                        }`}
                      >
                        {user.profile.first_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        @{user.profile.username || "bruker"}
                      </div>
                    </div>
                    <div
                      className={`ml-auto text-white ${
                        isFirst ? "text-xl font-extrabold" : "font-bold"
                      }`}
                    >
                      {user.count}x
                    </div>
                  </div>
                );
              })}
        </div>

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
