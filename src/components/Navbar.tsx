"use client";

import { Home, User, Plus, BarChart2, Bell, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import WorkoutForm from "@/components/WorkoutForm";

const navItems = [
  { href: "/dashboard", icon: Home },
  { href: "/profile", icon: User },
  { icon: Plus, isAction: true }, // ← denne trigges, ikke en link
  { href: "/stats", icon: BarChart2 },
  { href: "/notifications", icon: Bell },
];

export default function Navbar() {
  const pathname = usePathname();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow-md border-b">
        <div className="flex justify-between items-center px-4 h-16">
          {navItems.map(({ href, icon: Icon, isAction }) => {
            if (isAction) {
              return (
                <button
                  key="action"
                  onClick={() => setShowForm(true)}
                  className="p-3 bg-purple-600 text-white rounded-full shadow-md scale-110"
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            }

            return (
              <Link
                key={href}
                href={href!}
                className="flex-1 flex justify-center"
              >
                <div
                  className={`p-3 rounded-full ${
                    pathname === href ? "text-black" : "text-gray-500"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Modal for WorkoutForm */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 overflow-y-auto overscroll-contain">
          <div className="min-h-screen flex items-center justify-center py-8">
            <div className="bg-white rounded-xl p-4 w-full max-w-md relative mx-4">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>

              <WorkoutForm onCreated={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
