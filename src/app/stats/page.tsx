"use client";
import { Navbar } from "@/components";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import ContestCountdown from "@/components/ContestCountdown";
import Leaderboard from "@/components/Leaderboard";

export default function StatsPage() {
  const { user } = useAuth();
  const [isEnlisted, setIsEnlisted] = useState<boolean>(false);
  const [loadingEnlist, setLoadingEnlist] = useState(false);
  const [checkedEnlistment, setCheckedEnlistment] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  // Add floating animation effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

        <div className="px-4 py-8">
          <div className="max-w-md mx-auto space-y-6">
            {/* Contest Countdown */}
            <ContestCountdown
              isEnlisted={isEnlisted}
              handleEnlist={handleEnlist}
              loadingEnlist={loadingEnlist}
              checkedEnlistment={checkedEnlistment}
            />

            {/* Leaderboard */}
            <Leaderboard showStreaks={true} maxItems={10} />

            {/* Enlistment button */}
            {checkedEnlistment && !isEnlisted && (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl text-center">
                <h3 className="text-white font-semibold mb-2">
                  💒 Bli med i bryllupskonkurransen!
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  Konkurransen starter i morgen og varer til bryllupet 20. juni
                  2026
                </p>
                <button
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                  onClick={handleEnlist}
                  disabled={loadingEnlist}
                >
                  {loadingEnlist ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Melder på...
                    </div>
                  ) : (
                    "💒 Meld deg på bryllupskonkurranse"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
