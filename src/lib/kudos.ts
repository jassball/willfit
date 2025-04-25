import { supabase } from "@/lib/supabaseClient";

// Typene
export type KudosUser = {
  user_id: string;
  username?: string | null;
};

export type KudosListItem = {
  user_id: string;
  profile: {
    username: string;
  } | null; // profile kan være null
};

// Hent antall kudos
export async function fetchKudosCount(workoutId: string): Promise<number> {
  const { count, error } = await supabase
    .from("kudos")
    .select("id", { count: "exact", head: true })
    .eq("workout_id", workoutId);

  if (error) {
    console.error("Kudos count error:", error.message);
    throw new Error(error.message);
  }
  return count || 0;
}



// Sjekk om bruker har gitt kudos
export async function hasUserGivenKudos(
  workoutId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("kudos")
    .select("id")
    .eq("workout_id", workoutId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Kudos check error:", error.message);
    throw new Error(error.message);
  }

  return !!data;
}

// Hent brukere som har gitt kudos
export async function fetchKudosUsers(workoutId: string): Promise<KudosUser[]> {
  const { data, error } = await supabase
    .from("kudos")
    .select("user_id, profile:profiles!inner(username)")
    .eq("workout_id", workoutId);

  if (error) {
    console.error("Kudos list error:", error.message);
    throw new Error(error.message);
  }

  if (!data) return [];

  return (data as unknown[]).map((kudos) => {
    const item = kudos as {
      user_id: string;
      profile: { username: string } | { username: string }[] | null;
    };

    const profile = Array.isArray(item.profile)
      ? item.profile[0]
      : item.profile;

    return {
      user_id: item.user_id,
      username: profile?.username || null,
    };
  });
}

// Gi kudos
export async function giveKudos(workoutId: string, userId: string) {
  const { error } = await supabase
    .from("kudos")
    .insert([{ workout_id: workoutId, user_id: userId }]);

  if (error) {
    console.error("Give kudos error:", error.message);
    throw new Error(error.message);
  }
}

// Fjern kudos
export async function removeKudos(workoutId: string, userId: string) {
  const { error } = await supabase
    .from("kudos")
    .delete()
    .eq("workout_id", workoutId)
    .eq("user_id", userId);

  if (error) {
    console.error("Remove kudos error:", error.message);
    throw new Error(error.message);
  }
}
