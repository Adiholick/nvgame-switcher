import React, { useState } from "react";
import { GameItem } from "../types";
import { Star, Gamepad2, AlertTriangle } from "lucide-react";
import { ToggleSwitch } from "./common/ToggleSwitch";

interface GameRowProps {
  game: GameItem;
  isFavorite: boolean;
  isActive: boolean;
  onToggleActive: (game: GameItem, selectedExe: string) => void;
  onToggleFavorite: (appId: string) => void;
}

export const GameRow: React.FC<GameRowProps> = ({
  game,
  isFavorite,
  isActive,
  onToggleActive,
  onToggleFavorite,
}) => {
  const [selectedExe, setSelectedExe] = useState<string>(
    game.executables[0] || "game.exe"
  );
  const [imgError, setImgError] = useState(false);

  const iconUrl =
    game.icon && !imgError
      ? `https://cdn.discordapp.com/app-icons/${game.id}/${game.icon}.png?size=64`
      : null;

  return (
    <div
      className={`mx-3.5 my-1.5 p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
        isActive
          ? "bg-[#002B47]/40 border-[#00AAFF]/70 shadow-[0_0_15px_rgba(0,170,255,0.15)]"
          : "bg-[#252525] hover:bg-[#2A2A2E] border-[#38383A]"
      }`}
    >
      {/* Left: Icon & Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Game Icon */}
        <div className="w-10 h-10 rounded-lg bg-[#191919] border border-[#38383A] flex items-center justify-center overflow-hidden flex-shrink-0">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={game.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Gamepad2 className="w-5 h-5 text-gray-500" />
          )}
        </div>

        {/* Name and Executable Info */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-100 truncate">
              {game.name}
            </span>
            {game.is_generic && (
              <span
                className="flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium flex-shrink-0"
                title="This game uses a generic executable (e.g. javaw.exe). Discord might require specific command-line arguments to recognize it."
              >
                <AlertTriangle className="w-2.5 h-2.5" /> Generic
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {game.executables.length > 1 ? (
              <div className="relative inline-flex items-center">
                <select
                  value={selectedExe}
                  onChange={(e) => setSelectedExe(e.target.value)}
                  disabled={isActive}
                  className="bg-[#191919] text-gray-300 border border-[#3A3A3D] rounded px-1.5 py-0.5 text-[11px] font-mono focus:outline-none focus:border-[#00AAFF] max-w-[280px] truncate"
                >
                  {game.executables.map((exe) => (
                    <option key={exe} value={exe}>
                      {exe}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-500 ml-1.5 font-mono">
                  ({game.executables.length} variants)
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-gray-400 font-mono truncate max-w-[320px]">
                {selectedExe}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(game.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            isFavorite
              ? "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2">
          <ToggleSwitch
            checked={isActive}
            onChange={() => onToggleActive(game, selectedExe)}
          />
        </div>
      </div>
    </div>
  );
};
