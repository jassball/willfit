"use client";

import { useState } from "react";
import { useCreateWorkout } from "@/hooks/useWorkouts";

interface QuickAddProps {
  onCreated?: () => void;
}

export default function QuickAdd({ onCreated }: QuickAddProps) {
  const [error, setError] = useState("");
  const createWorkoutMutation = useCreateWorkout();

  const handleQuickAdd = async () => {
    setError("");

    createWorkoutMutation.mutate(
      {
        type: "Treningsøkt",
        note: null,
        pr: false,
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        image_url: null,
      },
      {
        onSuccess: () => {
          if (onCreated) onCreated();
        },
        onError: (error) => {
          console.error("Error creating quick workout:", error);
          setError("Kunne ikke logge treningsøkt. Prøv igjen.");
        },
      }
    );
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
      <div className="text-center">
        <h3 className="text-white font-semibold text-lg mb-2">Dårlig tid?</h3>
        <p className="text-white/70 text-sm mb-4">
          Logg en treningsøkt uten detaljer
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 mb-4 backdrop-blur-sm">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        <button
          onClick={handleQuickAdd}
          disabled={createWorkoutMutation.isPending}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:shadow-none"
        >
          {createWorkoutMutation.isPending ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Logger...
            </div>
          ) : (
            "⚡ Logg treningsøkt"
          )}
        </button>
      </div>
    </div>
  );
}
