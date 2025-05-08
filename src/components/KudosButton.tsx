import { useState } from "react";
import { PiHandsClapping, PiHeartFill } from "react-icons/pi";

type KudosButtonProps = {
  workoutId?: string;
  userId?: string;
  isButton: boolean;
  children?: React.ReactNode;
  hasGivenKudos: boolean;
  kudosCount: number;
  kudosUsers?: { user_id: string; username?: string }[];
  toggleKudos: () => void;
  variant?: "default" | "heart";
};

function KudosButton({
  isButton,
  hasGivenKudos,
  kudosCount,
  kudosUsers = [],
  toggleKudos,
  variant = "default",
  children,
}: KudosButtonProps) {
  const [showHeart, setShowHeart] = useState(false);

  const handleToggleKudos = () => {
    toggleKudos();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center w-12 h-12">
        {isButton ? (
          variant === "heart" ? (
            <button
              onClick={handleToggleKudos}
              className="relative text-xl focus:outline-none"
              title="Gi kudos"
              style={{ width: 48, height: 48 }}
            >
              <span className="block relative w-12 h-12">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill={hasGivenKudos ? "#f87171" : "none"}
                  stroke={hasGivenKudos ? "#f87171" : "#fff"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline-block align-middle"
                >
                  <path d="M35.25 8.25c-3.75 0-6.75 3-6.75 6.75 0-3.75-3-6.75-6.75-6.75C13.5 8.25 10.5 11.25 10.5 15c0 10.5 13.5 18 13.5 18s13.5-7.5 13.5-18c0-3.75-3-6.75-6.75-6.75z" />
                </svg>
                <span
                  className={`absolute inset-0 flex items-center justify-center text-base font-bold pointer-events-none select-none ${
                    hasGivenKudos ? "text-white" : "text-red-400"
                  }`}
                >
                  {kudosCount}
                </span>
              </span>
              {showHeart && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <PiHeartFill className="text-red-500 w-16 h-16 animate-ping" />
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={handleToggleKudos}
              className={`px-3 py-1 rounded flex items-center gap-2 ${
                hasGivenKudos
                  ? "bg-red-400 hover:bg-green-600"
                  : "bg-gray-100 hover:bg-blue-600"
              } text-black`}
            >
              <PiHandsClapping />({kudosCount})
            </button>
          )
        ) : (
          <div
            onDoubleClick={handleToggleKudos}
            className={`relative ${
              hasGivenKudos
                ? "border-2 border-red-400 rounded-lg"
                : "border-2 rounded-lg border-white"
            } rounded flex items-center`}
          >
            {children}
            {showHeart && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <PiHeartFill className="text-red-500 w-16 h-16 animate-ping" />
              </div>
            )}
          </div>
        )}
      </div>
      {/* Optionally show kudos users */}
      {kudosUsers.map((user) =>
        user.username ? (
          <div
            key={user.user_id}
            className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-sm"
          >
            <PiHandsClapping className="w-3 h-3" />
            <span>{user.username.slice(0, 5)}</span>
          </div>
        ) : null
      )}
    </div>
  );
}

export default KudosButton;
