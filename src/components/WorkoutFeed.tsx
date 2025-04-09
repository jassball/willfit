"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

type Workout = {
  id: string;
  user_id: string;
  type: string;
  note: string;
  pr: boolean;
  image_url?: string;
  created_at: string;
  kudos?: number;
  profile: {
    first_name: string;
    last_name: string;
    username: string;
    avatar_url?: string;
  };
  comments?: { id: string }[];
};

export default function WorkoutFeed() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [ownOnly, setOwnOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data } = supabase.storage
    .from("workout-images")
    .getPublicUrl(
      "workouts/182d5ad5-c035-4d6c-a2e9-6ca6965b3c5d_1744116388695.png"
    );

  console.log("bæsj" + data.publicUrl);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      const query = supabase
        .from("workouts")
        .select(
          "*, profile:profiles(id, first_name, last_name, username, avatar_url), comments(id)"
        )
        .order("created_at", { ascending: false });

      if (ownOnly && user) {
        query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (!error && data) {
        const workoutsWithUrls = await Promise.all(
          data.map(async (w) => {
            // Hent avatar signed URL
            let avatarSigned = "";
            if (w.profile?.avatar_url) {
              const { data: signed, error } = await supabase.storage
                .from("avatars")
                .createSignedUrl(w.profile.avatar_url, 60 * 60);
              if (signed && !error) avatarSigned = signed.signedUrl;
            }

            // Hent bilde signed URL
            let imageSigned = "";
            if (w.image_url) {
              const { data: signed, error } = await supabase.storage
                .from("workout-images")
                .createSignedUrl(w.image_url, 60 * 60);
              if (signed && !error) imageSigned = signed.signedUrl;
            }

            return {
              ...w,
              profile: {
                ...w.profile,
                avatar_url: avatarSigned || "",
              },
              image_url: imageSigned || "",
            };
          })
        );

        setWorkouts(workoutsWithUrls);
      }

      setLoading(false);
    };

    fetchWorkouts();
  }, [ownOnly, user]);

  if (loading) return <p>Laster treningsøkter...</p>;

  return (
    <div className="">
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={ownOnly}
          onChange={(e) => setOwnOnly(e.target.checked)}
        />
        <span>Vis kun egne økter</span>
      </label>

      {workouts.length === 0 ? (
        <p className="text-white">Ingen treningsøkter funnet.</p>
      ) : (
        workouts.map((w) => {
          console.log("image_url:", w.image_url);
          return (
            <div
              key={w.id}
              className="rounded-xl bg-black text-white shadow-xl mb-6 p-4 space-y-2"
            >
              {/* Brukerinfo */}
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={w.profile.avatar_url || "/default-avatar.png"}
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
              {w.image_url && (
                <img
                  src={w.image_url}
                  alt="treningsbilde"
                  className="w-full rounded-lg border mt-2"
                />
              )}

              {/* Metadata */}
              <div className="text-sm text-gray-400">
                {new Date(w.created_at).toLocaleString()}
              </div>

              {/* Tittel / PR / Notat */}
              <h3 className="text-lg font-bold">{w.type}</h3>
              {w.pr && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  PR!
                </span>
              )}
              {w.note && <p>{w.note}</p>}

              {/* Interaksjon */}
              <div className="flex gap-4 items-center pt-2 text-gray-300">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14 9l-3 6h3l-3 6" />
                  </svg>
                  <span>{w.kudos || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{w.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
