import { useState } from "react";
import { PiHandsClapping } from "react-icons/pi";
import { PiHeartFill } from "react-icons/pi"; // Eller bruk et annet hjerteikon hvis du ønsker

type KudosButtonProps = {
  workoutId: string;
  userId: string;
  isButton: boolean;
  children?: React.ReactNode;
  hasGivenKudos: boolean;
  kudosCount: number;
  kudosUsers: { user_id: string; username?: string }[];
  toggleKudos: () => void;
};

function KudosButton({
  isButton,
  children,
  hasGivenKudos,
  kudosCount,
  kudosUsers,
  toggleKudos,
}: KudosButtonProps) {
  const [showHeart, setShowHeart] = useState(false);

  const handleToggleKudos = () => {
    toggleKudos();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800); // Hjerte vises i 800ms
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {isButton ? (
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={handleToggleKudos}
            className={`px-3 py-1 rounded flex items-center gap-2 ${
              hasGivenKudos
                ? "bg-red-400 hover:bg-green-600"
                : "bg-white hover:bg-blue-600"
            } text-black`}
          >
            {hasGivenKudos ? (
              <>
                <PiHandsClapping />({kudosCount})
              </>
            ) : (
              <>
                <PiHandsClapping className="" />({kudosCount})
              </>
            )}
          </button>
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

          {/* ❤️ Hjerte overlay */}
          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <PiHeartFill className="text-red-500 w-16 h-16 animate-ping" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default KudosButton;
