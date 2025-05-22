"use client";
import { useEffect, useState } from "react";

// Fixed challenge period
function getChallengeStartDate(): Date {
  return new Date("2025-05-23T00:00:00Z");
}

function getChallengeEndDate(): Date {
  const end = new Date(getChallengeStartDate());
  end.setDate(end.getDate() + 28); // 4 weeks
  return end;
}

function getTimeDiff(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { totalSeconds, days, hours, minutes, seconds };
}

type ContestCountdownProps = {
  isEnlisted: boolean;
  handleEnlist: () => void;
  loadingEnlist: boolean;
  checkedEnlistment: boolean;
};

export default function ContestCountdown({
  isEnlisted,
  handleEnlist,
  loadingEnlist,
  checkedEnlistment,
}: ContestCountdownProps) {
  const target = getChallengeEndDate();
  const [timeLeft, setTimeLeft] = useState(() => getTimeDiff(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeDiff(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const totalInitialSeconds = 28 * 24 * 3600; // 4 uker
  const percent = 100 - (timeLeft.totalSeconds / totalInitialSeconds) * 100;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="w-72 h-72 relative flex flex-col items-center justify-center rounded-full bg-gray-800 shadow-xl">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="135"
            stroke=""
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="50%"
            cy="50%"
            r="135"
            stroke="red"
            strokeWidth="12"
            strokeDasharray={`${Math.PI * 2 * 135}`}
            strokeDashoffset={`${Math.PI * 2 * 135 * (percent / 100)}`}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="text-center z-10">
          <h2 className="text-xl mb-1">GJENSTÅENDE TID</h2>
          <p className="text-5xl font-bold">{timeLeft.days}d</p>
          <p className="text-lg">
            {timeLeft.hours}t {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        </div>
      </div>
      {checkedEnlistment && (
        <button
          className={`mt-6 py-2 px-6 rounded-full text-lg font-semibold disabled:opacity-60 ${
            isEnlisted
              ? "border-red-500 border-2 text-white cursor-default"
              : "bg-blue-500 text-white border-red-500"
          }`}
          onClick={isEnlisted ? undefined : handleEnlist}
          disabled={loadingEnlist || isEnlisted}
        >
          {isEnlisted
            ? "Du er påmeldt!"
            : loadingEnlist
            ? "Enlisting..."
            : "Enter Contest"}
        </button>
      )}
    </div>
  );
}
