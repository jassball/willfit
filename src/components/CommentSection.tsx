import { useEffect, useState } from "react";
import { PiTrash } from "react-icons/pi";
import { supabase } from "@/lib/supabaseClient"; // Tilpass til din Supabase-klient

import { AvatarImage } from "@/components/AvatarImage";

type Comment = {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string | null;
  content: string;
  created_at: string;
};

type CommentSectionProps = {
  workoutId: string;
  currentUserId: string;
  workoutOwnerId: string;
  avatar_url: string | null;
  readOnly?: boolean;
  visible?: boolean;
};

function CommentSection({
  workoutId,
  currentUserId,
  workoutOwnerId,
  visible = true,
  readOnly = false,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Hent kommentarer når komponenten mountes
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        user_id,
        content,
        created_at,
        profiles (username, avatar_url)
      `
      )
      .eq("workout_id", workoutId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      const formattedComments = (
        data as {
          id: string;
          user_id: string;
          content: string;
          created_at: string;
          profiles: { username?: string; avatar_url?: string | null } | null;
        }[]
      ).map((comment) => ({
        id: comment.id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        username: comment.profiles?.username || "Ukjent",
        avatar_url: comment.profiles?.avatar_url || null,
      }));
      setComments(formattedComments);
    }
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    const { error } = await supabase.from("comments").insert({
      workout_id: workoutId,
      user_id: currentUserId,
      content: newComment.trim(),
    });

    if (error) {
      console.error("Error adding comment:", error);
    } else {
      setNewComment("");
      fetchComments();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
    } else {
      fetchComments();
    }
  };

  const canDelete = (commentUserId: string) =>
    currentUserId === commentUserId || currentUserId === workoutOwnerId;

  return (
    <div
      className={
        visible
          ? "px-6 py-3 rounded-full shadow-lg backdrop-blur-sm bg-[rgba(1,0,0,0.44)] mt-2 flex flex-col gap-2"
          : "hidden"
      }
    >
      {/* Input for å legge til kommentar */}
      {!readOnly && (
        <form onSubmit={handleAddComment} className="flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Skriv en kommentar..."
            className="flex-1 px-3 py-2 rounded-full bg-white/80 text-black focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center"
            aria-label="Send"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10.5l7.5 7.5m0 0l7.5-7.5m-7.5 7.5V3"
              />
            </svg>
          </button>
        </form>
      )}

      {/* Kommentarer */}
      {loading ? (
        <div className="italic text-white">Laster kommentarer...</div>
      ) : comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex justify-between">
              <div className="flex items-center gap-2">
                <AvatarImage avatarPath={comment.avatar_url} />
                <div>
                  <span className="text-xs text-white font-semibold">
                    @{comment.username}
                  </span>
                  <p className="text-sm text-white">{comment.content}</p>
                </div>
              </div>
              {canDelete(comment.user_id) && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <PiTrash />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p></p>
      )}
    </div>
  );
}

export default CommentSection;
