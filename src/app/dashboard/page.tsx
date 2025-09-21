"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import { WorkoutFeed, useAuth, Navbar } from "@/components";
import Leaderboard from "@/components/Leaderboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        router.push("/profile");
      } else {
        setProfile(data);
        setLoading(false);
      }
    };
    checkProfile();
  }, [user, router]);

  // Add floating animation effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!user || loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.05}px`,
            top: `${mousePosition.y * 0.05}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            right: `${mousePosition.x * 0.03}px`,
            bottom: `${mousePosition.y * 0.03}px`,
            transform: "translate(50%, 50%)",
          }}
        />
        <div
          className="absolute w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            left: `${50 + mousePosition.x * 0.01}%`,
            top: `${30 + mousePosition.y * 0.01}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        <Navbar />

        {/* Header section */}
        <div className="px-4 pt-8 pb-6">
          <div className="max-w-md mx-auto">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Velkommen tilbake!
                </h1>
                {profile?.username && (
                  <p className="text-white/70 text-sm">
                    Hei, {profile.username}! 👋
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mini Leaderboard */}
        <div className="px-4 pb-6">
          <div className="max-w-md mx-auto">
            <Leaderboard compact={true} showStreaks={true} maxItems={3} />
          </div>
        </div>

        {/* Workout Feed */}
        <div className="px-4 pb-24">
          <WorkoutFeed />
        </div>
      </div>
    </div>
  );
}
