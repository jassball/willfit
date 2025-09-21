"use client";

import { Home, User, Plus, BarChart2, Bell, X, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import WorkoutForm from "@/components/WorkoutForm";
import QuickAdd from "@/components/QuickAdd";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Hjem" },
  { href: "/profile", icon: User, label: "Profil" },
  { icon: Plus, isAction: true, label: "Legg til" },
  { href: "/stats", icon: BarChart2, label: "Statistikk" },
  { href: "/notifications", icon: Bell, label: "Varsler" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [showForm, setShowForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <>
      {/* Liquid Glass Navbar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl">
          <div className="flex justify-around items-center py-3 px-2">
            {navItems.map(({ href, icon: Icon, isAction, label }) => {
              const isActive = pathname === href;

              if (isAction) {
                return (
                  <div key="action" className="relative group">
                    <button
                      onClick={() => setShowForm(true)}
                      className="relative"
                      title={label}
                    >
                      {/* Central Add Button with Glow Effect */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                        <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full shadow-lg transform group-hover:scale-110 transition-all duration-300">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </button>

                    {/* Quick Add Button */}
                    <button
                      onClick={() => setShowQuickAdd(true)}
                      className="absolute -top-16 right-0 bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300"
                      title="Rask registrering"
                    >
                      <Zap className="w-5 h-5 text-white" />
                    </button>
                  </div>
                );
              }

              return (
                <Link
                  key={href}
                  href={href!}
                  className="relative group flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300"
                  title={label}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 rounded-2xl" />
                  )}

                  {/* Icon container */}
                  <div
                    className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/70 group-hover:text-white group-hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-xs mt-1 transition-all duration-300 ${
                      isActive
                        ? "text-white font-medium"
                        : "text-white/60 group-hover:text-white/80"
                    }`}
                  >
                    {label}
                  </span>

                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Liquid Glass Modal for WorkoutForm */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
          {/* Backdrop with blur */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal content */}
          <div className="relative min-h-screen flex items-center justify-center py-8 px-4">
            <div className="relative w-full max-w-md">
              {/* Glass container */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl" />

                {/* Header with close button */}
                <div className="relative p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-semibold text-lg">
                      Legg til økt
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Form content */}
                <div className="relative p-4">
                  <WorkoutForm onCreated={() => setShowForm(false)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
          {/* Backdrop with blur */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal content */}
          <div className="relative min-h-screen flex items-center justify-center py-8 px-4">
            <div className="relative w-full max-w-md">
              {/* Glass container */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl" />

                {/* Header with close button */}
                <div className="relative p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-white font-semibold text-lg">
                      Rask registrering
                    </h2>
                    <button
                      onClick={() => setShowQuickAdd(false)}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Quick Add content */}
                <div className="relative p-4">
                  <QuickAdd onCreated={() => setShowQuickAdd(false)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
