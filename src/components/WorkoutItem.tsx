"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import CommentSection from "@/components/CommentSection";
import { Crown, Trophy, Heart, MessageCircle, Trash2 } from "lucide-react";
import {
  useKudosCount,
  useHasUserGivenKudos,
  useGiveKudos,
  useRemoveKudos,
} from "@/hooks/useKudos";
import { useComments } from "@/hooks/useComments";
import { useDeleteWorkout } from "@/hooks/useWorkouts";
import { Workout } from "@/lib/workout";

interface WorkoutItemProps {
  workout: Workout;
  isTopPerformer: boolean;
  isFirstPlace: boolean;
  onDelete?: (id: string) => void;
}

export default function WorkoutItem({
  workout,
  isTopPerformer,
  isFirstPlace,
  onDelete,
}: WorkoutItemProps) {
  const { user } = useAuth();
  const [openComments, setOpenComments] = useState(false);

  // TanStack Query hooks for this specific workout
  const { data: kudosCount = 0 } = useKudosCount(workout.id);
  const { data: hasGivenKudos = false } = useHasUserGivenKudos(workout.id);
  const { data: comments = [] } = useComments(workout.id);
  const giveKudosMutation = useGiveKudos();
  const removeKudosMutation = useRemoveKudos();
  const deleteWorkoutMutation = useDeleteWorkout();

  const hasComments = comments.length > 0;

  const toggleKudos = () => {
    if (!user?.id) return;

    if (hasGivenKudos) {
      removeKudosMutation.mutate({ workoutId: workout.id, userId: user.id });
    } else {
      giveKudosMutation.mutate({ workoutId: workout.id, userId: user.id });
    }
  };

  const toggleCommentSection = () => {
    setOpenComments(!openComments);
  };

  const handleDelete = () => {
    const confirmed = confirm("Er du sikker på at du vil slette denne økten?");
    if (!confirmed) return;

    deleteWorkoutMutation.mutate(workout.id);
    onDelete?.(workout.id);
  };

  return (
    <div
      className={`relative w-full backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${
        isTopPerformer
          ? isFirstPlace
            ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50"
            : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
          : "bg-white/10 border border-white/20"
      }`}
    >
      {/* Special glow effect for top performers */}
      {isTopPerformer && (
        <div
          className={`absolute inset-0 rounded-3xl animate-pulse pointer-events-none ${
            isFirstPlace
              ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
              : "bg-gradient-to-r from-purple-500/10 to-pink-500/10"
          }`}
        />
      )}

      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl pointer-events-none" />

      {/* Header with user info and delete button */}
      <div className="relative p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={workout.profile.avatar_url || "/avatar-modified.ico"}
                alt="Avatar"
                width={48}
                height={48}
                className={`w-12 h-12 rounded-full object-cover ${
                  isTopPerformer
                    ? isFirstPlace
                      ? "border-2 border-yellow-400"
                      : "border-2 border-purple-400"
                    : "border-2 border-white/20"
                }`}
              />
              {isTopPerformer && (
                <div
                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                    isFirstPlace ? "bg-yellow-400" : "bg-purple-400"
                  }`}
                >
                  {isFirstPlace ? (
                    <Crown className="w-3 h-3 text-yellow-900" />
                  ) : (
                    <Trophy className="w-3 h-3 text-purple-900" />
                  )}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p
                  className={`font-semibold text-sm ${
                    isTopPerformer
                      ? isFirstPlace
                        ? "text-yellow-100"
                        : "text-purple-100"
                      : "text-white"
                  }`}
                >
                  {workout.profile.first_name} {workout.profile.last_name}
                </p>
                {isTopPerformer && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      isFirstPlace
                        ? "bg-yellow-400/20 text-yellow-300"
                        : "bg-purple-400/20 text-purple-300"
                    }`}
                  >
                    {isFirstPlace ? "🥇 #1" : "🏆 Top 3"}
                  </div>
                )}
              </div>
              <p className="text-white/60 text-xs">
                @{workout.profile.username}
              </p>
            </div>
          </div>
          {user?.id === workout.user_id && (
            <button
              onClick={handleDelete}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
              title="Slett økt"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Image */}
      {workout.image_url && (
        <div className="relative">
          <Image
            src={workout.image_url}
            alt="Workout"
            width={400}
            height={256}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4 relative z-10">
        {/* Workout details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{workout.type}</h3>
            <span className="text-white/60 text-sm">
              {new Date(workout.date).toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          {workout.note && (
            <p className="text-white/80 text-sm">{workout.note}</p>
          )}
          {workout.pr && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full">
              🏆 PR!
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 relative z-10">
          <div className="flex items-center gap-4">
            {/* Kudos button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleKudos();
              }}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors relative z-20"
            >
              <div
                className={`p-2 rounded-full transition-all duration-200 ${
                  hasGivenKudos
                    ? "bg-red-500/20 text-red-400"
                    : "hover:bg-white/10"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${hasGivenKudos ? "fill-current" : ""}`}
                />
              </div>
              <span className="text-sm">{kudosCount}</span>
            </button>

            {/* Comment button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCommentSection();
              }}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors relative z-20"
            >
              <div
                className={`p-2 rounded-full transition-all duration-200 ${
                  openComments
                    ? "bg-blue-500/20 text-blue-400"
                    : hasComments
                    ? "bg-green-500/20 text-green-400"
                    : "hover:bg-white/10"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
              </div>
              {hasComments && !openComments && (
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comments section */}
      {openComments && (
        <div className="border-t border-white/10">
          <CommentSection
            workoutId={workout.id}
            currentUserId={user?.id || ""}
            workoutOwnerId={workout.user_id}
            avatar_url={workout.profile.avatar_url || "/avatar-modified.ico"}
            readOnly={false}
            visible={true}
          />
        </div>
      )}
    </div>
  );
}
