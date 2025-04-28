"use client";

import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        // 🛠 Try refreshing the session if nothing in localStorage
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshData.session) {
          setSession(refreshData.session);
          setUser(refreshData.session.user);
        } else {
          console.warn("Session could not be refreshed:", refreshError);
          setSession(null);
          setUser(null);
        }
      } else {
        setSession(sessionData.session);
        setUser(sessionData.session.user);
      }
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
