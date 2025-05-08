import { supabase } from "@/lib/supabaseClient";

export async function getAvatarSignedUrl(avatarPath?: string | null): Promise<string> {
  if (!avatarPath) return "/avatar-modified.ico";
  if (avatarPath.startsWith("http")) return avatarPath;
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(avatarPath, 60 * 60); // 1 hour expiry
  if (error || !data?.signedUrl) return "/avatar-modified.ico";
  return data.signedUrl;
}