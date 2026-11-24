export interface GameItem {
  id: string;
  name: string;
  icon: string | null;
  executables: string[];
  is_generic?: boolean;
}

export interface ActiveSession {
  app_id: string;
  game_name: string;
  executable_path: string;
  started_at: string;
  pid: number;
}

export interface HistoryItem {
  id: string;
  name: string;
  last_played_at: string;
  total_seconds: number;
}

export interface AppSettings {
  favorites: string[];
  recent_history: HistoryItem[];
  minimize_to_tray_on_close: boolean;
  auto_cleanup_on_exit: boolean;
  notify_on_auto_switch?: boolean;
  auto_switch_unplayed_only?: boolean;
  auto_switch_min_minutes?: number;
  auto_switch_max_minutes?: number;
}

export interface AutoSwitchState {
  enabled: boolean;
  targetEndTime: number | null;
  remainingSeconds: number;
}

export type TabType = "all" | "favorites" | "history";
