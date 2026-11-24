import React, { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Shuffle } from "lucide-react";
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
    notify_on_auto_switch: true,
    auto_switch_unplayed_only: false,
    auto_switch_min_minutes: 7,
    auto_switch_max_minutes: 20,
  });
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  // Auto Switch states
  const [isAutoSwitch, setIsAutoSwitch] = useState<boolean>(false);
  const [autoSwitchTargetTime, setAutoSwitchTargetTime] = useState<number | null>(null);
  const [autoSwitchRemainingSecs, setAutoSwitchRemainingSecs] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // History Map lookup for fast metadata retrieval
  const historyMap = useMemo(() => {
    return new Map(settings.recent_history.map((h) => [h.id, h]));
  }, [settings.recent_history]);

  // Total unplayed games count
  const unplayedCount = useMemo(() => {
    const playedIds = new Set(settings.recent_history.map((h) => h.id));
    return games.filter((g) => !playedIds.has(g.id)).length;
  }, [games, settings.recent_history]);

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
    const unlistenPromise = listen("session-stopped", async () => {
      setActiveSession(null);
      try {
        const updated = await invoke<AppSettings>("get_settings");
        setSettings(updated);
      } catch (e) {
        // ignore
      }
    });

    // Interval check for active session status (in case user closed dummy externally)
    const checkInterval = setInterval(async () => {
      try {
        const session = await invoke<ActiveSession | null>("get_active_session");
        setActiveSession((prev) => {
          if (prev && !session) {
            // Process just ended, refresh history
            invoke<AppSettings>("get_settings").then(setSettings).catch(() => {});
          }
          return session;
        });
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
    if (isStarting) return;
    setIsStarting(true);
    try {
      if (activeSession?.app_id === game.id) {
        // Stop current simulation
        setIsAutoSwitch(false);
        setAutoSwitchTargetTime(null);
        setAutoSwitchRemainingSecs(null);
        await invoke("stop_simulation");
        setActiveSession(null);
        // Refresh settings to update history
        const updated = await invoke<AppSettings>("get_settings");
        setSettings(updated);
      } else {
        // Start simulation
        const newSession = await invoke<ActiveSession>("start_simulation", {
          appId: game.id,
          gameName: game.name,
          relativePath: selectedExe,
        });
        setActiveSession(newSession);
        // Refresh settings so the newly started game immediately shows up in Recently Played
        const updated = await invoke<AppSettings>("get_settings");
        setSettings(updated);
      }
    } catch (err) {
      console.error("Simulation error:", err);
      alert(`Failed to start game activity: ${err}`);
    } finally {
      setIsStarting(false);
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

  // Show in-app Toast & Windows notification (Zero-lag, non-blocking)
  const notifyGameSwitched = (gameName: string) => {
    if (settings.notify_on_auto_switch ?? true) {
      setToastMessage(`Auto Switch: Sekarang bermain ${gameName}`);
      setTimeout(() => setToastMessage(null), 4500);

      try {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("NVGame Switcher", {
            body: `Auto Switch: Beralih ke ${gameName}`,
            silent: true,
          });
        }
      } catch (e) {
        // ignore notification error
      }
    }
  };

  // Get random duration between configured min and max minutes
  const getRandomDuration = () => {
    const minMins = Math.max(1, settings.auto_switch_min_minutes ?? 7);
    const maxMins = Math.max(minMins, settings.auto_switch_max_minutes ?? 20);
    const minSecs = minMins * 60;
    const maxSecs = maxMins * 60;
    return Math.floor(Math.random() * (maxSecs - minSecs + 1)) + minSecs;
  };

  // Pick random game according to settings:
  // - Tab context (favorites tab vs all games)
  // - Switch Unplayed Game mode (excludes all games already in recent_history)
  const pickRandomGame = (excludeId?: string): GameItem | null => {
    let pool = games;
    if (activeTab === "favorites" && settings.favorites.length > 0) {
      const favGames = games.filter((g) => settings.favorites.includes(g.id));
      if (favGames.length > 0) {
        pool = favGames;
      }
    }

    // Filter unplayed games only if setting is enabled
    if (settings.auto_switch_unplayed_only) {
      const playedIds = new Set(settings.recent_history.map((h) => h.id));
      pool = pool.filter((g) => !playedIds.has(g.id));
    }

    const validGames = pool.filter((g) => g.executables && g.executables.length > 0);
    if (validGames.length === 0) return null;

    const candidates =
      validGames.length > 1 && excludeId
        ? validGames.filter((g) => g.id !== excludeId)
        : validGames;

    if (candidates.length === 0) return null;

    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  // Trigger switch to next random game
  const triggerNextAutoSwitch = async (excludeId?: string) => {
    const nextGame = pickRandomGame(excludeId);
    if (!nextGame) {
      if (settings.auto_switch_unplayed_only) {
        setToastMessage("Auto Switch: Semua game dalam daftar sudah pernah dimainkan!");
        setTimeout(() => setToastMessage(null), 5000);
        setIsAutoSwitch(false);
        setAutoSwitchTargetTime(null);
        setAutoSwitchRemainingSecs(null);
      }
      return;
    }
    const selectedExe = nextGame.executables[0] || "game.exe";

    try {
      const newSession = await invoke<ActiveSession>("start_simulation", {
        appId: nextGame.id,
        gameName: nextGame.name,
        relativePath: selectedExe,
      });
      setActiveSession(newSession);

      // Refresh settings immediately so history reflects newly played game
      const updated = await invoke<AppSettings>("get_settings");
      setSettings(updated);

      const durationSecs = getRandomDuration();
      const targetTime = Date.now() + durationSecs * 1000;
      setAutoSwitchTargetTime(targetTime);
      setAutoSwitchRemainingSecs(durationSecs);

      notifyGameSwitched(nextGame.name);
    } catch (err) {
      console.error("Auto Switch error:", err);
    }
  };

  // Toggle Auto Switch On/Off
  const handleToggleAutoSwitch = () => {
    if (isAutoSwitch) {
      setIsAutoSwitch(false);
      setAutoSwitchTargetTime(null);
      setAutoSwitchRemainingSecs(null);
      setToastMessage("Auto Switch dinonaktifkan");
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      // Validate if unplayed games exist when unplayed mode is enabled
      if (settings.auto_switch_unplayed_only) {
        const playedIds = new Set(settings.recent_history.map((h) => h.id));
        let pool = games;
        if (activeTab === "favorites" && settings.favorites.length > 0) {
          const favGames = games.filter((g) => settings.favorites.includes(g.id));
          if (favGames.length > 0) pool = favGames;
        }
        const unplayed = pool.filter(
          (g) => !playedIds.has(g.id) && g.executables && g.executables.length > 0
        );
        if (unplayed.length === 0) {
          setToastMessage("Auto Switch: Semua game dalam daftar sudah pernah dimainkan!");
          setTimeout(() => setToastMessage(null), 4500);
          return;
        }
      }

      setIsAutoSwitch(true);
      if (activeSession) {
        // Continue current session, schedule next random switch
        const durationSecs = getRandomDuration();
        const targetTime = Date.now() + durationSecs * 1000;
        setAutoSwitchTargetTime(targetTime);
        setAutoSwitchRemainingSecs(durationSecs);
        const minutes = Math.max(1, Math.round(durationSecs / 60));
        setToastMessage(`Auto Switch aktif! Berganti dalam ~${minutes} menit`);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        // Start immediate random game
        triggerNextAutoSwitch();
      }
    }
  };

  // Countdown timer effect for Auto Switch
  useEffect(() => {
    if (!isAutoSwitch || !autoSwitchTargetTime) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.round((autoSwitchTargetTime - Date.now()) / 1000));
      setAutoSwitchRemainingSecs(diff);

      if (diff <= 0) {
        // Time expired! Switch to next random game
        triggerNextAutoSwitch(activeSession?.app_id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isAutoSwitch,
    autoSwitchTargetTime,
    activeSession?.app_id,
    games,
    settings.favorites,
    settings.recent_history,
    settings.auto_switch_unplayed_only,
    settings.auto_switch_min_minutes,
    settings.auto_switch_max_minutes,
    activeTab,
  ]);

  // Filtered games based on tab and instant search query:
  // History tab displays 100% of played games in chronological order without omission
  const filteredGames = useMemo(() => {
    let sourceList = games;

    if (activeTab === "favorites") {
      sourceList = games.filter((g) => settings.favorites.includes(g.id));
    } else if (activeTab === "history") {
      const gameMap = new Map(games.map((g) => [g.id, g]));
      const historyGames: GameItem[] = [];
      for (const h of settings.recent_history) {
        const found = gameMap.get(h.id);
        if (found) {
          historyGames.push(found);
        } else {
          historyGames.push({
            id: h.id,
            name: h.name,
            icon: null,
            executables: ["game.exe"],
          });
        }
      }
      sourceList = historyGames;
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

      {/* Active Session Banner with Live Stopwatch & Auto Switch countdown */}
      <ActiveSessionBanner
        session={activeSession}
        isAutoSwitch={isAutoSwitch}
        autoSwitchRemainingSecs={autoSwitchRemainingSecs}
        onStop={async () => {
          setIsAutoSwitch(false);
          setAutoSwitchTargetTime(null);
          setAutoSwitchRemainingSecs(null);
          if (activeSession) {
            const foundGame = games.find((g) => g.id === activeSession.app_id);
            if (foundGame) {
              await handleToggleActive(foundGame, activeSession.executable_path);
            } else {
              await invoke("stop_simulation");
              setActiveSession(null);
              const updated = await invoke<AppSettings>("get_settings");
              setSettings(updated);
            }
          }
        }}
      />

      {/* Header with Search, Auto Switch, Sync, and Settings */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSync={handleSync}
        isSyncing={isSyncing}
        totalGames={games.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isAutoSwitch={isAutoSwitch}
        onToggleAutoSwitch={handleToggleAutoSwitch}
      />

      {/* Tab Bar (All / Favorites / Recently Played) */}
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
          historyMap={historyMap}
        />
      )}

      {/* Preferences & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        unplayedCount={unplayedCount}
      />

      {/* Auto Switch Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#161618] border border-[#00AAFF] text-[#00FFFF] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-pulse backdrop-blur-md">
          <Shuffle className="w-4 h-4 text-[#00FF66]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
