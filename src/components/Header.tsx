import React from "react";
import { Search, RefreshCw, Settings as SettingsIcon } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  totalGames: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSync,
  isSyncing,
  totalGames,
  onOpenSettings,
}) => {
  return (
    <div className="p-3.5 border-b border-[#2C2C2E] bg-[#161618] flex items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-lg">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${totalGames > 0 ? totalGames.toLocaleString() : ""} games or .exe filenames...`}
          className="w-full pl-9 pr-3 py-1.5 bg-[#0D0D0D] border border-[#333336] rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00AAFF] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSync}
          disabled={isSyncing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            isSyncing
              ? "bg-[#252525] border-[#38383A] text-gray-400 cursor-not-allowed"
              : "bg-[#252525] hover:bg-[#2F2F32] border-[#3F3F3F] text-gray-200 hover:text-white"
          }`}
          title="Fetch latest detectable games catalog from Discord"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#00AAFF]" : ""}`} />
          <span>{isSyncing ? "Syncing..." : "Sync DB"}</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-[#252525] hover:bg-[#2F2F32] border border-[#3F3F3F] text-gray-300 hover:text-white transition-all"
          title="Settings & Preferences"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
