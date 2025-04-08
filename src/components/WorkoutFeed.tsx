"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";

type Workout = {
  id: string;
  user_id: string;
  type: string;
  note: string;
  pr: boolean;
  image_url?: string;
  created_at: string;
};

export default function WorkoutFeed() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [ownOnly, setOwnOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      const query = supabase
        .from("workouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (ownOnly && user) {
        query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (!error && data) {
        setWorkouts(data as Workout[]);
      }

      setLoading(false);
    };

    fetchWorkouts();
  }, [ownOnly, user]);

  if (loading) return <p>Laster treningsøkter...</p>;

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={ownOnly}
          onChange={(e) => setOwnOnly(e.target.checked)}
        />
        <span>Vis kun egne økter</span>
      </label>

      {workouts.length === 0 ? (
        <p className="text-gray-500">Ingen treningsøkter funnet.</p>
      ) : (
        workouts.map((w) => (
          <div
            key={w.id}
            className="p-4 rounded-xl bg-white shadow space-y-2 border"
          >
            <div className="text-sm text-gray-500">
              {new Date(w.created_at).toLocaleString()}
            </div>
            <h3 className="text-lg font-semibold">{w.type}</h3>
            {w.pr && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                PR!
              </span>
            )}
            {w.note && <p className="text-gray-700">{w.note}</p>}
            {w.image_url && (
              <Image
                src={w.image_url}
                alt="treningsbilde"
                className="w-full rounded mt-2 border"
                width={50}
                height={50}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
