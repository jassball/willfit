"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const publicRoutes = ["/login", "/profile"]; // evt. legg til "/"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  if (loading || (!user && !publicRoutes.includes(pathname))) {
    return null; // eventuelt en loader
  }

  return <>{children}</>;
}
