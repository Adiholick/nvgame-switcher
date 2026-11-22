import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { GameItem, ActiveSession } from "../types";
import { GameRow } from "./GameRow";
import { SearchX } from "lucide-react";

interface GameListProps {
  games: GameItem[];
  favorites: string[];
  activeSession: ActiveSession | null;
  onToggleActive: (game: GameItem, selectedExe: string) => void;
  onToggleFavorite: (appId: string) => void;
}

export const GameList: React.FC<GameListProps> = ({
  games,
  favorites,
  activeSession,
  onToggleActive,
  onToggleFavorite,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: games.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    overscan: 6,
  });

  if (games.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <SearchX className="w-12 h-12 mb-3 text-gray-600" />
        <p className="text-sm font-semibold text-gray-400">No games found</p>
        <p className="text-xs text-gray-600 mt-1">
          Try adjusting your search query or sync the database with Discord.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto min-h-0 relative select-none"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const game = games[virtualRow.index];
          const isFavorite = favorites.includes(game.id);
          const isActive = activeSession?.app_id === game.id;

          return (
            <div
              key={game.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <GameRow
                game={game}
                isFavorite={isFavorite}
                isActive={isActive}
                onToggleActive={onToggleActive}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
