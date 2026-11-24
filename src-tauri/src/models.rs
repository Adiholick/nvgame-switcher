use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameItem {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub executables: Vec<String>,
    #[serde(default)]
    pub is_generic: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveSession {
    pub app_id: String,
    pub game_name: String,
    pub executable_path: String,
    pub started_at: String,
    pub pid: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryItem {
    pub id: String,
    pub name: String,
    pub last_played_at: String,
    pub total_seconds: u64,
}

fn default_true() -> bool {
    true
}

fn default_false() -> bool {
    false
}

fn default_min_minutes() -> u32 {
    7
}

fn default_max_minutes() -> u32 {
    20
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub favorites: Vec<String>,
    pub recent_history: Vec<HistoryItem>,
    pub minimize_to_tray_on_close: bool,
    pub auto_cleanup_on_exit: bool,
    #[serde(default = "default_true")]
    pub notify_on_auto_switch: bool,
    #[serde(default = "default_false")]
    pub auto_switch_unplayed_only: bool,
    #[serde(default = "default_min_minutes")]
    pub auto_switch_min_minutes: u32,
    #[serde(default = "default_max_minutes")]
    pub auto_switch_max_minutes: u32,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            favorites: Vec::new(),
            recent_history: Vec::new(),
            minimize_to_tray_on_close: true,
            auto_cleanup_on_exit: true,
            notify_on_auto_switch: true,
            auto_switch_unplayed_only: false,
            auto_switch_min_minutes: 7,
            auto_switch_max_minutes: 20,
        }
    }
}
