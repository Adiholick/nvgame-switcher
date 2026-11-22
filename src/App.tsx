import React, { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { GameItem, ActiveSession, AppSettings, TabType } from "./types";
import { TitleBar } from "./components/TitleBar";
import { Header } from "./components/Header";
import { TabNavigation } from "./components/TabNavigation";
import { GameList } from "./components/GameList";
import { ActiveSessionBanner } from "./components/ActiveSessionBanner";
import { SettingsModal } from "./components/SettingsModal";

export const App: React.FC = () => {
  const [games, setGames] = useState<GameItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    favorites: [],
    recent_history: [],
    minimize_to_tray_on_close: true,
    auto_cleanup_on_exit: true,
  });
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const [loadedGames, loadedSettings, currentSession] = await Promise.all([
          invoke<GameItem[]>("get_games"),
          invoke<AppSettings>("get_settings"),
          invoke<ActiveSession | null>("get_active_session"),
        ]);
        setGames(loadedGames || []);
        if (loadedSettings) setSettings(loadedSettings);
        setActiveSession(currentSession);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();

    // Listen for session stopped from Tray
    const unlistenPromise = listen("session-stopped", () => {
      setActiveSession(null);
    });

    // Interval check for active session status (in case user closed dummy externally)
    const checkInterval = setInterval(async () => {
      try {
        const session = await invoke<ActiveSession | null>("get_active_session");
        setActiveSession(session);
      } catch (e) {
        // ignore
      }
    }, 4000);

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
      clearInterval(checkInterval);
    };
  }, []);

  // Handle Sync with Discord API
  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const freshGames = await invoke<GameItem[]>("sync_games");
      setGames(freshGames || []);
    } catch (err) {
      console.error("Sync error:", err);
      alert(`Failed to sync games with Discord API: ${err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Toggle Active Simulation
  const handleToggleActive = async (game: GameItem, selectedExe: string) => {
    if (activeSession?.app_id === game.id) {
      // Stop current simulation
      try {
        await invoke("stop_simulation");
        setActiveSession(null);
        // Refresh settings to update history
        const updated = await invoke<AppSettings>("get_settings");
        setSettings(updated);
      } catch (err) {
        console.error("Stop simulation error:", err);
      }
    } else {
      // Start simulation
      try {
        const newSession = await invoke<ActiveSession>("start_simulation", {
          appId: game.id,
          gameName: game.name,
          relativePath: selectedExe,
        });
        setActiveSession(newSession);
      } catch (err) {
        console.error("Start simulation error:", err);
        alert(`Failed to start game activity: ${err}`);
      }
    }
  };

  // Handle Favorite toggle
  const handleToggleFavorite = async (appId: string) => {
    try {
      const updated = await invoke<AppSettings>("toggle_favorite", { appId });
      setSettings(updated);
    } catch (err) {
      console.error("Toggle favorite error:", err);
    }
  };

  // Handle Update Settings
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    try {
      const updated = await invoke<AppSettings>("update_settings", {
        newSettings,
      });
      setSettings(updated);
    } catch (err) {
      console.error("Update settings error:", err);
    }
  };

  // Filtered games based on tab and instant search query
  const filteredGames = useMemo(() => {
    let sourceList = games;

    if (activeTab === "favorites") {
      sourceList = games.filter((g) => settings.favorites.includes(g.id));
    } else if (activeTab === "history") {
      const historyIds = settings.recent_history.map((h) => h.id);
      sourceList = games
        .filter((g) => historyIds.includes(g.id))
        .sort((a, b) => {
          const indexA = historyIds.indexOf(a.id);
          const indexB = historyIds.indexOf(b.id);
          return indexA - indexB;
        });
    }

    if (!searchQuery.trim()) {
      return sourceList;
    }

    const query = searchQuery.toLowerCase().trim();
    return sourceList.filter((game) => {
      if (game.name.toLowerCase().includes(query)) return true;
      return game.executables.some((exe) => exe.toLowerCase().includes(query));
    });
  }, [games, settings.favorites, settings.recent_history, activeTab, searchQuery]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1C1C1E] text-white overflow-hidden select-none">
      {/* Windows 11 Fluent Draggable Titlebar */}
      <TitleBar />

      {/* Active Session Banner with Live Stopwatch */}
      <ActiveSessionBanner
        session={activeSession}
        onStop={() => {
          if (activeSession) {
            const foundGame = games.find((g) => g.id === activeSession.app_id);
            if (foundGame) {
              handleToggleActive(foundGame, activeSession.executable_path);
            } else {
              invoke("stop_simulation").then(() => setActiveSession(null));
            }
          }
        }}
      />

      {/* Header with Search and Actions */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSync={handleSync}
        isSyncing={isSyncing}
        totalGames={games.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Tab Bar (All / Favorites / History) */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        allCount={games.length}
        favoritesCount={settings.favorites.length}
        historyCount={settings.recent_history.length}
      />

      {/* Virtualized Game List */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="w-8 h-8 border-2 border-[#00AAFF] border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-semibold text-gray-400">
            Loading game catalog...
          </span>
        </div>
      ) : (
        <GameList
          games={filteredGames}
          favorites={settings.favorites}
          activeSession={activeSession}
          onToggleActive={handleToggleActive}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Preferences & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};
