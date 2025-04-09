"use client";
import { FaCamera } from "react-icons/fa";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function WorkoutForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();

  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [pr, setPr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!type) {
      setError("Du må skrive inn type økt");
      return;
    }

    setLoading(true);
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
        setLoading(false);
        return;
      }

      supabase.storage
        .from("workout-images")
        .getPublicUrl(filePath);

      imageUrl = filePath;
    }

    // 🟢 Legg inn økta i databasen
    const { error } = await supabase.from("workouts").insert([
      {
        user_id: user?.id,
        type,
        note,
        pr,
        image_url: imageUrl || null,
      },
    ]);

    setLoading(false);

    if (error) {
      setError("Kunne ikke lagre økt: " + error.message);
    } else {
      setType("");
      setNote("");
      setPr(false);
      setImageFile(null);
      if (onCreated) onCreated();
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Logg ny treningsøkt</h2>
      <div className="mb-3 border rounded flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 border-b-2 w-full p-3">
          <FaCamera />
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
          />
        </div>
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Forhåndsvisning"
            className="w-full h-auto mb-3 rounded-lg shadow-lg"
            width={50}
            height={50}
          />
        )}
      </div>

      <input
        placeholder="Type (f.eks. styrke, løping)"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full p-3 border rounded mb-3"
      />

      <textarea
        placeholder="Notat (valgfritt)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full p-3 border rounded mb-3"
      />

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={pr}
          onChange={(e) => setPr(e.target.checked)}
        />
        <span>Personlig rekord (PR)?</span>
      </label>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
      >
        {loading ? "Lagrer..." : "Lagre økt"}
      </button>
    </div>
  );
}
