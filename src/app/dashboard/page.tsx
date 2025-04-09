"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import { WorkoutForm, WorkoutFeed, useAuth, Navbar } from "@/components";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string } | null>(null);

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

  if (!user || loading) return null;

  return (
    <div className="p-1">
      <Navbar />
      <h1 className="text-xl font-bold">Willfit Dashboard</h1>
      {/* Økter og + knapp kommer her */}

      {profile?.username && (
        <p className="text-gray-700 mb-4">Velkommen, {profile.username}!</p>
      )}

      <WorkoutFeed />
    </div>
  );
}
