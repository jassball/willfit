"use client";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { useCreateWorkout } from "@/hooks/useWorkouts";
import { format, subDays } from "date-fns";
import { nb } from "date-fns/locale";

export default function WorkoutForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();

  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [pr, setPr] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // TanStack Query mutation
  const createWorkoutMutation = useCreateWorkout();

  // 🔵 Legg til state for dato
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // 🔵 Lag liste over dagens dato og seks dager bakover
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), i);
    return {
      value: format(d, "yyyy-MM-dd"),
      label: format(d, "EEEE d. MMMM", { locale: nb }),
    };
  });

  const handleSubmit = async () => {
    if (!type) {
      setError("Du må skrive inn type økt");
      return;
    }

    setError("");

    let imageUrl = "";

    // 🟢 Bildeopplasting hvis bilde er valgt
    if (imageFile && user) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `workouts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("workout-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        setError("Kunne ikke laste opp bilde: " + uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("workout-images")
        .getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    // Use TanStack Query mutation
    createWorkoutMutation.mutate(
      {
        type,
        note: note || null,
        pr,
        image_url: imageUrl || null,
        date,
      },
      {
        onSuccess: () => {
          setType("");
          setNote("");
          setPr(false);
          setImageFile(null);
          setPreviewUrl(null);
          if (onCreated) onCreated();
        },
        onError: (error) => {
          setError("Kunne ikke lagre økt: " + error.message);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white/80">
          Bilde (valgfritt)
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setImageFile(file);
              if (file) {
                setPreviewUrl(URL.createObjectURL(file));
              } else {
                setPreviewUrl(null);
              }
            }}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30"
          />
        </div>
        {previewUrl && (
          <div className="relative rounded-2xl overflow-hidden">
            <Image
              src={previewUrl}
              alt="Forhåndsvisning"
              className="w-full h-48 object-cover"
              width={400}
              height={200}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
      </div>

      {/* Workout type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          Type økt
        </label>
        <input
          placeholder="Type (f.eks. styrke, løping)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          Notater (valgfritt)
        </label>
        <textarea
          placeholder="Beskriv økten din..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm resize-none"
        />
      </div>

      {/* PR checkbox */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={pr}
            onChange={(e) => setPr(e.target.checked)}
            className="w-5 h-5 bg-white/10 border border-white/20 rounded text-blue-500 focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-white/80 font-medium">
            Personlig rekord (PR) 🏆
          </span>
        </label>
      </div>

      {/* Date selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          Når ble økten gjennomført?
        </label>
        <select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm"
        >
          {last7Days.map((d) => (
            <option
              key={d.value}
              value={d.value}
              className="bg-gray-800 text-white"
            >
              {d.label.charAt(0).toUpperCase() + d.label.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 backdrop-blur-sm">
          <p className="text-red-200 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={createWorkoutMutation.isPending}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:shadow-none"
      >
        {createWorkoutMutation.isPending ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Lagrer...
          </div>
        ) : (
          "Lagre økt"
        )}
      </button>
    </div>
  );
}
