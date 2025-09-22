import { supabase } from "@/lib/supabaseClient";

export type Workout = {
  id: string;
  user_id: string;
  type: string;
  note: string;
  pr: boolean;
  date: string;
  image_url?: string;
  created_at: string;
  kudos?: number;
  kudosUsers?: {
    user_id: string;
    username?: string | null;
  }[];
  profile: {
    first_name: string;
    last_name: string;
    username: string;
    avatar_url?: string;
  };
  comments?: { id: string }[];
};

// Create a new workout
export async function createWorkout(workoutData: {
  user_id: string;
  type: string;
  note: string | null;
  pr: boolean;
  image_url: string | null;
  date: string;
}) {
  const { data, error } = await supabase
    .from("workouts")
    .insert([workoutData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Slett en workout
export async function deleteWorkout(workoutId: string) {
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId);
  if (error) throw new Error(error.message);
}

// Hent nyeste `created_at` (brukes for caching)
export async function fetchLatestWorkoutCreatedAt(
  ownOnly: boolean,
  userId?: string
) {
  const query = supabase
    .from("workouts")
    .select("id, created_at, date")
    .order("created_at", { ascending: false })
    .limit(1);

  if (ownOnly && userId) {
    query.eq("user_id", userId);
  }

  const { data } = await query;
  return data?.[0]?.created_at || null;
}

// Hent hele workouts-listen + signer avatar/image URLs
export async function fetchAllWorkouts(
  ownOnly: boolean,
  userId?: string
): Promise<Workout[]> {
  const query = supabase
    .from("workouts")
    .select(
      "*, profile:profiles(id, first_name, last_name, username, avatar_url), comments(id)"
    )
    .order("created_at", { ascending: false });

  if (ownOnly && userId) {
    query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error || !data) throw new Error(error?.message || "Ingen data");

  const workoutsWithUrls = await Promise.all(
    data.map(async (w: Workout) => {
      let avatarSigned = "";
      if (w.profile?.avatar_url) {
        const { data: signed, error } = await supabase.storage
          .from("avatars")
          .createSignedUrl(w.profile.avatar_url, 60 * 60);
        if (signed && !error) avatarSigned = signed.signedUrl;
      }

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

  return workoutsWithUrls;
}
