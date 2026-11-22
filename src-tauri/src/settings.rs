use crate::cache::get_app_data_dir;
use crate::models::{AppSettings, HistoryItem};
use chrono::Utc;
use std::path::PathBuf;

pub fn get_settings_file_path() -> PathBuf {
    get_app_data_dir().join("settings.json")
}

pub fn load_settings() -> AppSettings {
    let settings_path = get_settings_file_path();
    if settings_path.exists() {
        if let Ok(content) = std::fs::read_to_string(&settings_path) {
            if let Ok(settings) = serde_json::from_str::<AppSettings>(&content) {
                return settings;
            }
        }
    }
    AppSettings::default()
}

pub fn save_settings(settings: &AppSettings) -> Result<(), String> {
    let settings_path = get_settings_file_path();
    if let Some(parent) = settings_path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let data = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    std::fs::write(&settings_path, data)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;
    Ok(())
}

pub fn toggle_favorite(app_id: &str) -> Result<AppSettings, String> {
    let mut settings = load_settings();
    if let Some(idx) = settings.favorites.iter().position(|id| id == app_id) {
        settings.favorites.remove(idx);
    } else {
        settings.favorites.push(app_id.to_string());
    }
    save_settings(&settings)?;
    Ok(settings)
}

pub fn record_played(app_id: &str, name: &str, duration_secs: u64) -> Result<AppSettings, String> {
    let mut settings = load_settings();
    let now = Utc::now().to_rfc3339();

    if let Some(item) = settings.recent_history.iter_mut().find(|h| h.id == app_id) {
        item.last_played_at = now;
        item.total_seconds += duration_secs;
        item.name = name.to_string();
    } else {
        settings.recent_history.insert(
            0,
            HistoryItem {
                id: app_id.to_string(),
                name: name.to_string(),
                last_played_at: now,
                total_seconds: duration_secs,
            },
        );
    }

    // Limit history to 50 items
    if settings.recent_history.len() > 50 {
        settings.recent_history.truncate(50);
    }

    save_settings(&settings)?;
    Ok(settings)
}
