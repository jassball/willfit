import { useState } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";

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
              className="relative w-10 h-10 focus:outline-none"
              title="Gi kudos"
            >
              {/* Statisk eller "tomt" hjerte */}
              {!hasGivenKudos && (
                <FaRegHeart
                  className={`absolute inset-0 text-white w-full h-full transition-opacity duration-300 ${
                    showHeart ? "opacity-0" : "opacity-100"
                  }`}
                />
              )}

              {/* Fylte hjerte ved reaksjon eller hvis man har gitt kudos */}
              {(hasGivenKudos || showHeart) && (
                <FaHeart
                  className={`absolute inset-0 w-full h-full text-red-500 ${
                    showHeart ? "animate-ping z-20" : ""
                  }`}
                />
              )}

              {/* Antall kudos */}
              <span
                className={`absolute inset-0 flex items-center justify-center text-base font-bold pointer-events-none select-none ${
                  hasGivenKudos ? "text-white" : "text-red-400"
                }`}
              >
                {kudosCount}
              </span>
            </button>
          ) : (
            <button
              onClick={handleToggleKudos}
              className={`px-3 py-1 rounded flex items-center gap-2 ${
                hasGivenKudos
                  ? "bg-red-400 hover:bg-green-600"
                  : "bg-gray-100 hover:bg-blue-600"
              } text-black`}
            ></button>
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
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none"></div>
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
            <span>{user.username.slice(0, 5)}</span>
          </div>
        ) : null
      )}
    </div>
  );
}

export default KudosButton;
