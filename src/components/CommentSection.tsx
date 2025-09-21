import { useState } from "react";
import { PiTrash } from "react-icons/pi";
import { AvatarImage } from "@/components/AvatarImage";
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from "@/hooks/useComments";

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
  const [newComment, setNewComment] = useState("");

  // TanStack Query hooks
  const { data: comments = [], isLoading } = useComments(workoutId);
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || addCommentMutation.isPending) return;

    addCommentMutation.mutate(
      { workoutId, content: newComment },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (confirm("Er du sikker på at du vil slette denne kommentaren?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (!visible) return null;

  return (
    <div className="px-4 py-3 backdrop-blur-xl bg-white/5 border-t border-white/10 flex flex-col gap-3">
      {/* Comment input */}
      {!readOnly && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Skriv en kommentar..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm"
              disabled={addCommentMutation.isPending}
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            {addCommentMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Send"
            )}
          </button>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-white/60 text-sm mt-2">Laster kommentarer...</p>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-white/60 text-sm text-center py-4">
            Ingen kommentarer ennå.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start gap-3">
                <AvatarImage avatarPath={comment.profile.avatar_url} size={8} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium text-sm">
                      {comment.profile.first_name} {comment.profile.last_name}
                    </p>
                    <p className="text-white/60 text-xs">
                      @{comment.profile.username}
                    </p>
                    <p className="text-white/40 text-xs">
                      {new Date(comment.created_at).toLocaleDateString(
                        "nb-NO",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <p className="text-white/80 text-sm">{comment.content}</p>
                </div>
                {(currentUserId === comment.user_id ||
                  currentUserId === workoutOwnerId) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Slett kommentar"
                  >
                    <PiTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
