"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Navbar } from "@/components";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // 🟢 Hent eksisterende profil hvis den finnes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setUsername(data.username || "");
        setInitialUsername(data.username || "");

        setBirthdate(data.birthdate || "");
        setInitialBirthdate(data.birthdate || "");

        setEmail(data.email || "");
        setInitialEmail(data.email || "");
      }
    };

    fetchProfile();
  }, [user]);

  const [initialUsername, setInitialUsername] = useState("");
  const [initialBirthdate, setInitialBirthdate] = useState("");
  const [initialEmail, setInitialEmail] = useState("");

  const isUsernameSet = !!initialUsername;
  const isBirthdateSet = !!initialBirthdate;
  const isEmailSet = !!initialEmail;

  const handleSave = async () => {
    setError("");
    setLoading(true);

    let avatarUrl = "";

    if (avatarFile && user) {
      const ext = avatarFile.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${ext}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile);

      if (uploadError) {
        setError("Kunne ikke laste opp bilde: " + uploadError.message);
        setLoading(false);
        return;
      }

      avatarUrl = filePath;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user?.id,
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      gender,
      birthdate,
      avatar_url: avatarUrl || undefined,
    });

    setLoading(false);

    if (error) {
      setError("Kunne ikke lagre profil: " + error.message);
    } else {
      router.push("/dashboard");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Navbar />
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Din profil</h1>
        <div className="mb-4">
          <label className="block font-medium mb-1">Profilbilde</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        <input
          placeholder="Fornavn"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-3 border rounded mb-3"
        />
        <input
          placeholder="Etternavn"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-3 border rounded mb-3"
        />
        <input
          placeholder="Brukernavn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          readOnly={isUsernameSet}
          className={`w-full p-3 border rounded mb-3 ${
            isUsernameSet ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
          }`}
        />

        <input
          type="email"
          placeholder="E-post"
          value={email}
          readOnly={isEmailSet}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full p-3 border rounded mb-3 ${
            isEmailSet ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
          }`}
        />

        <input
          type="text"
          placeholder="Telefonnummer"
          value={user.phone ?? ""}
          readOnly
          className="w-full p-3 border rounded mb-3 bg-gray-100 text-gray-600 cursor-not-allowed"
        />
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          readOnly={isBirthdateSet}
          className={`w-full p-3 border rounded mb-3 ${
            isBirthdateSet ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
          }`}
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-3 border rounded mb-3"
        >
          <option value="">Velg kjønn</option>
          <option value="mann">Mann</option>
          <option value="kvinne">Kvinne</option>
          <option value="annet">Annet</option>
        </select>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Lagrer..." : "Lagre og fortsett"}
        </button>
      </div>
    </div>
  );
}
