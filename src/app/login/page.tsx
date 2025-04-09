"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSendCode = async () => {
    setErrorMsg("");
    if (!phone.match(/^\+47\d{8}$/)) {
      setErrorMsg("Skriv inn gyldig norsk mobilnummer i format +47XXXXXXXX");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setStep("verify");
    }
  };

  const handleVerifyCode = async () => {
    setErrorMsg("");
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      setErrorMsg("Feil kode. Prøv igjen.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-sm w-full bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4 text-center text-black">
          Logg inn / Registrer med mobilnummer
        </h1>

        {step === "phone" ? (
          <>
            <input
              type="tel"
              placeholder="+47 12345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border rounded mb-3"
            />
            {errorMsg && (
              <p className="text-red-600 text-sm mb-3">{errorMsg}</p>
            )}
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
            >
              {loading ? "Sender kode..." : "Send kode"}
            </button>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm text-gray-700">
              Skriv inn koden du fikk på SMS:
            </p>
            <input
              type="text"
              placeholder="6-sifret kode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 border rounded mb-3 text-black"
            />
            {errorMsg && (
              <p className="text-red-600 text-sm mb-3">{errorMsg}</p>
            )}
            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 transition"
            >
              {loading ? "Verifiserer..." : "Logg inn"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
