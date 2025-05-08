import React from "react";
import KudosButton from "@/components/KudosButton";

interface WorkoutInfoBoxProps {
  date: string;
  type: string;
  note?: string;
  kudosCount: number;
  hasGivenKudos: boolean;
  onToggleKudos: () => void;
  commentCount?: number;
  onCommentClick: () => void;
}

const WorkoutInfoBox: React.FC<WorkoutInfoBoxProps> = ({
  date,
  type,
  note,
  kudosCount,
  hasGivenKudos,
  onToggleKudos,
  commentCount = 0,
  onCommentClick,
}) => (
  <div className="flex justify-between items-center px-6 py-3 rounded-full shadow-lg backdrop-blur-sm bg-[rgba(1,0,0,0.44)]">
    {/* Left side: date, type, note */}
    <div className="flex flex-col items-start">
      <span className="text-xs text-white opacity-80">
        {(() => {
          const dateObj = new Date(date);
          const weekday = dateObj.toLocaleDateString("nb-NO", {
            weekday: "long",
          });
          const capitalizedWeekday =
            weekday.charAt(0).toUpperCase() + weekday.slice(1);
          const dayMonth = dateObj.toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "short",
          });
          return `${capitalizedWeekday} ${dayMonth}`;
        })()}
      </span>
      <span className="text-base font-semibold text-white">{type}</span>
      {note && (
        <span className="text-xs text-white opacity-80 mt-1">{note}</span>
      )}
    </div>
    {/* Right side: like and comment */}
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center">
        <KudosButton
          isButton={true}
          hasGivenKudos={hasGivenKudos}
          kudosCount={kudosCount}
          toggleKudos={onToggleKudos}
          variant="heart"
        />
      </div>
      <button
        onClick={onCommentClick}
        className="w-12 h-12 flex items-center justify-center text-white text-xl focus:outline-none relative"
        title="Kommentarer"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="block"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {commentCount > 0 && (
          <span className="absolute top-1 right-1 bg-white text-gray-800 text-xs rounded-full px-1">
            {commentCount}
          </span>
        )}
      </button>
    </div>
  </div>
);

export default WorkoutInfoBox;
