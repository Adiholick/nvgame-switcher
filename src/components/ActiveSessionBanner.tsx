import React, { useEffect, useState } from "react";
import { ActiveSession } from "../types";
import { Square, Cpu, Shuffle } from "lucide-react";

interface ActiveSessionBannerProps {
  session: ActiveSession | null;
  onStop: () => void;
  isAutoSwitch?: boolean;
  autoSwitchRemainingSecs?: number | null;
}

export const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({
  session,
  onStop,
  isAutoSwitch = false,
  autoSwitchRemainingSecs = null,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!session) {
      setElapsedSeconds(0);
      return;
    }

    const startTime = new Date(session.started_at).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="bg-gradient-to-r from-[#004A77]/40 via-[#191919] to-[#191919] border-b border-[#00AAFF]/40 px-4 py-2.5 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        {/* Pulsing live indicator */}
        <div className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#00FF66] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF66]"></span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#00AAFF] uppercase tracking-wider">
              Currently Simulating
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-gray-400 font-mono flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" /> PID: {session.pid}
            </span>
          </div>
          <span className="text-sm font-bold text-white leading-tight">
            {session.game_name}
          </span>
          <span className="text-[11px] text-gray-400 font-mono truncate max-w-[360px]">
            {session.executable_path}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Auto Switch Countdown Indicator */}
        {isAutoSwitch && autoSwitchRemainingSecs !== null && (
          <div className="flex flex-col items-end pr-3 border-r border-[#333336]">
            <span className="text-[10px] text-[#00FFFF] uppercase tracking-wider font-semibold flex items-center gap-1">
              <Shuffle className="w-2.5 h-2.5 animate-spin" /> Auto Switch In
            </span>
            <span className="font-mono text-base font-bold text-[#00FF66] tracking-wider">
              {Math.floor(autoSwitchRemainingSecs / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(autoSwitchRemainingSecs % 60).toString().padStart(2, "0")}
            </span>
          </div>
        )}

        {/* Stopwatch */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
            Session Time
          </span>
          <span className="font-mono text-base font-bold text-[#00FFFF] tracking-widest">
            {formattedTime}
          </span>
        </div>

        {/* Stop button */}
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF453A]/20 hover:bg-[#FF453A] text-[#FF453A] hover:text-white border border-[#FF453A]/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};
