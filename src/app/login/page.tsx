"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isYvonneMode, setIsYvonneMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Add floating animation effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSendCode = async () => {
    setErrorMsg("");
    if (!phone.match(/^\d{8}$/)) {
      setErrorMsg("Skriv inn gyldig norsk mobilnummer (8 siffer)");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+47${phone}`,
    });
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
      phone: `+47${phone}`,
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

  const handleYvonneLogin = async () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Fyll inn både e-post og passord");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setErrorMsg("Ugyldig e-post eller passord");
      } else {
        setErrorMsg("Feil ved innlogging: " + error.message);
      }
    } else {
      router.push("/dashboard");
    }
  };

  const handleYvonneSignup = async () => {
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Fyll inn både e-post og passord");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Passord må være minst 6 tegn");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("User already registered")) {
        setErrorMsg(
          "E-post er allerede registrert. Prøv å logge inn i stedet."
        );
      } else {
        setErrorMsg("Feil ved registrering: " + error.message);
      }
    } else {
      setErrorMsg(
        "Registrering vellykket! Sjekk e-posten din for bekreftelse."
      );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.1}px`,
            top: `${mousePosition.y * 0.1}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            right: `${mousePosition.x * 0.05}px`,
            bottom: `${mousePosition.y * 0.05}px`,
            transform: "translate(50%, 50%)",
          }}
        />
        <div
          className="absolute w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            left: `${50 + mousePosition.x * 0.02}%`,
            top: `${30 + mousePosition.y * 0.02}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Glass card */}
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl" />

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Velkommen til Willfit
              </h1>
              <p className="text-white/70 text-sm">
                {isYvonneMode
                  ? "Logg inn med e-post og passord"
                  : "Din personlige treningspartner"}
              </p>
            </div>

            {/* YVONNE Toggle */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <button
                  onClick={() => setIsYvonneMode(!isYvonneMode)}
                  className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                    isYvonneMode
                      ? "bg-gradient-to-r from-pink-500 to-purple-500"
                      : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1  left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                      isYvonneMode ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="ml-3   text-white font-medium text-sm">
                  YVONNE?
                </span>
              </div>
            </div>

            {step === "phone" ? (
              <div className="space-y-6">
                {/* Phone input for OTP mode */}
                {!isYvonneMode && (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 text-lg font-medium z-10">
                      +47
                    </div>
                    <input
                      type="tel"
                      placeholder="12345678"
                      value={phone}
                      onChange={(e) => {
                        // Only allow digits and ensure it starts with +47
                        const value = e.target.value.replace(/\D/g, "");
                        setPhone(value);
                      }}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Email input for YVONNE mode */}
                {isYvonneMode && (
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="din@epost.no"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Password input for YVONNE mode */}
                {isYvonneMode && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Passord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
                    </div>
                    <p className="text-white/60 text-xs text-center">
                      💡 Yvonne-modus bruker e-post og passord
                    </p>
                  </div>
                )}

                {/* Error message */}
                {errorMsg && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 backdrop-blur-sm">
                    <p className="text-red-200 text-sm text-center">
                      {errorMsg}
                    </p>
                  </div>
                )}

                {/* Submit buttons */}
                {isYvonneMode ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleYvonneLogin}
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Logger inn...
                        </div>
                      ) : (
                        "Logg inn"
                      )}
                    </button>
                    <button
                      onClick={handleYvonneSignup}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Registrerer...
                        </div>
                      ) : (
                        "Registrer ny bruker"
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Sender kode...
                      </div>
                    ) : (
                      "Send kode"
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-4">
                    Skriv inn koden du fikk på SMS:
                  </p>
                </div>

                {/* OTP input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="6-sifret kode"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 backdrop-blur-sm">
                    <p className="text-red-200 text-sm text-center">
                      {errorMsg}
                    </p>
                  </div>
                )}

                {/* Verify button */}
                <button
                  onClick={handleVerifyCode}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Verifiserer...
                    </div>
                  ) : (
                    "Logg inn"
                  )}
                </button>

                {/* Back button */}
                <button
                  onClick={() => setStep("phone")}
                  className="w-full py-3 text-white/70 hover:text-white transition-colors text-sm"
                >
                  ← Tilbake
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/50 text-xs">
              Ved å fortsette godtar du våre vilkår
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
