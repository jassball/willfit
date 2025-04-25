"use client";
import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { format, subDays } from "date-fns";
import { nb } from "date-fns/locale";

export default function WorkoutForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();

  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [pr, setPr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

      supabase.storage.from("workout-images").getPublicUrl(filePath);

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
        date, // 🔵 Legg til dato her
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
    <div className="bg-white p-4 rounded-xl shadow mb-6 text-black">
      <h2 className="text-lg font-semibold mb-4 ">Logg ny treningsøkt</h2>
      <div className="mb-3 border rounded flex flex-col items-center gap-2">
        <input
          className="w-full bg-[linear-gradient(to_right,_black_23%,_#d1d5db_20%)] rounded-sm text-white p-3  "
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

        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Forhåndsvisning"
            className=" w-full shadow-lg"
            width={250}
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
      <label className="block mb-3">
        <span className="block mb-1">Når ble økten gjennomført?</span>
        <select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border rounded"
        >
          {last7Days.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label.charAt(0).toUpperCase() + d.label.slice(1)}
            </option>
          ))}
        </select>
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
