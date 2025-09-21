"use client";
import { useEffect, useState } from "react";

// Wedding competition period
function getChallengeStartDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow
  return tomorrow;
}

function getChallengeEndDate(): Date {
  return new Date("2026-06-20T23:59:59Z"); // Wedding day
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

  const startDate = getChallengeStartDate();
  const endDate = getChallengeEndDate();
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = endDate.getTime() - new Date().getTime();
  const percent = Math.max(
    0,
    Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100)
  );

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          💒 Bryllupskonkurranse
        </h2>
        <p className="text-white/70 text-sm">
          Konkurransen starter i morgen og varer til bryllupet 20. juni 2026!
        </p>
      </div>

      <div className="w-48 h-48 relative flex flex-col items-center justify-center rounded-full bg-white/10 shadow-xl mx-auto mb-6">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="90"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50%"
            cy="50%"
            r="90"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeDasharray={`${Math.PI * 2 * 90}`}
            strokeDashoffset={`${Math.PI * 2 * 90 * (percent / 100)}`}
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-center z-10">
          <h3 className="text-lg mb-2 text-white/80">Gjenstående tid</h3>
          <p className="text-4xl font-bold text-white">{timeLeft.days}d</p>
          <p className="text-sm text-white/70">
            {timeLeft.hours}t {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        </div>
      </div>

      {checkedEnlistment && (
        <button
          className={`py-3 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 ${
            isEnlisted
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-default"
              : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transform hover:scale-105"
          }`}
          onClick={isEnlisted ? undefined : handleEnlist}
          disabled={loadingEnlist || isEnlisted}
        >
          {isEnlisted
            ? "🎉 Du er påmeldt!"
            : loadingEnlist
            ? "Melder på..."
            : "💒 Meld deg på bryllupskonkurranse"}
        </button>
      )}
    </div>
  );
}
