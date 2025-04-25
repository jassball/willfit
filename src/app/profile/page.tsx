"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { Navbar, WorkoutFeed } from "@/components";

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
  const [avatarUrl, setAvatarUrl] = useState<string>("");

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

        if (data.avatar_url) {
          const { data: signedUrlData } = await supabase.storage
            .from("avatars")
            .createSignedUrl(data.avatar_url, 60 * 60); // 1 time gyldig

          setAvatarUrl(signedUrlData?.signedUrl || "");
        }
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

  const boxStyle = "w-full p-3 border border-black rounded mb-3 text-black";

  // Legg til rett etter `if (!user) return null;`

  const isProfileComplete =
    firstName && lastName && username && email && birthdate;

  if (isProfileComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <Navbar />
        <div className="bg-white p-6 rounded-xl shadow w-full max-w-md text-center ">
          <h1 className="text-xl font-bold mb-4">Din profil</h1>
          <div className="flex justify-center">
            {/* Hent signed URL for avatar */}
            <img
              src={avatarUrl || "/default-avatar.png"}
              alt="Profilbilde"
              className="w-24 h-24 rounded-full shadow-lg "
            />
          </div>
          <p className="mt-4 text-gray-700">Hei {firstName}!</p>
        </div>

        <WorkoutFeed ownOnlyByDefault={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Navbar />
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md mt-24">
        <h1 className="text-xl font-bold mb-4 text-center text-black">
          Din profil
        </h1>
        <div className="mb-4">
          <label className="block font-medium mb-1 text-black">
            Profilbilde
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="w-full bg-[linear-gradient(to_right,_black_23%,_#d1d5db_20%)] rounded-sm text-white p-3 "
          />
        </div>

        <input
          placeholder="Fornavn"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={boxStyle}
        />
        <input
          placeholder="Etternavn"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={boxStyle}
        />
        <input
          placeholder="Brukernavn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          readOnly={isUsernameSet}
          className={`${boxStyle} ${
            isUsernameSet ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
          }`}
        />

        <input
          type="email"
          placeholder="E-post"
          value={email}
          readOnly={isEmailSet}
          onChange={(e) => setEmail(e.target.value)}
          className={`${boxStyle}  ${
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
          placeholder="Fødselsdato"
          onChange={(e) => setBirthdate(e.target.value)}
          readOnly={isBirthdateSet}
          className={`${boxStyle} 3 ${
            isBirthdateSet ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""
          }`}
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className={boxStyle}
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

        <WorkoutFeed ownOnlyByDefault={true} />
      </div>
      <h1>hei</h1>
    </div>
  );
}
