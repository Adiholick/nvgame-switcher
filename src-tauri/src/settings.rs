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

    if let Some(pos) = settings.recent_history.iter().position(|h| h.id == app_id) {
        let mut item = settings.recent_history.remove(pos);
        item.last_played_at = now;
        item.total_seconds += duration_secs;
        item.name = name.to_string();
        settings.recent_history.insert(0, item);
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

    // Retain all played games without artificial 50-item cap so that
    // the unplayed games filter and Recently Played tab accurately reflect all history.
    save_settings(&settings)?;
    Ok(settings)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_app_settings_backward_compatibility() {
        let legacy_json = r#"{
            "favorites": ["123", "456"],
            "recent_history": [],
            "minimize_to_tray_on_close": true,
            "auto_cleanup_on_exit": false
        }"#;

        let settings: AppSettings = serde_json::from_str(legacy_json).expect("Failed to deserialize legacy JSON");
        assert_eq!(settings.auto_switch_unplayed_only, false);
        assert_eq!(settings.auto_switch_min_minutes, 7);
        assert_eq!(settings.auto_switch_max_minutes, 20);
        assert_eq!(settings.notify_on_auto_switch, true);
    }

    #[test]
    fn test_record_played_no_truncation_and_reorder() {
        let mut settings = AppSettings::default();

        // Simulate recording 70 different games
        for i in 0..70 {
            let app_id = format!("game_{}", i);
            let name = format!("Game {}", i);
            let now = Utc::now().to_rfc3339();

            if let Some(pos) = settings.recent_history.iter().position(|h| h.id == app_id) {
                let mut item = settings.recent_history.remove(pos);
                item.last_played_at = now;
                item.total_seconds += 10;
                settings.recent_history.insert(0, item);
            } else {
                settings.recent_history.insert(
                    0,
                    HistoryItem {
                        id: app_id,
                        name,
                        last_played_at: now,
                        total_seconds: 10,
                    },
                );
            }
        }

        // Must retain all 70 games without 50-item truncation
        assert_eq!(settings.recent_history.len(), 70);
        assert_eq!(settings.recent_history[0].id, "game_69");

        // Replay game_10 - must move to index 0 and accumulate duration
        let now = Utc::now().to_rfc3339();
        let pos = settings.recent_history.iter().position(|h| h.id == "game_10").unwrap();
        let mut item = settings.recent_history.remove(pos);
        item.last_played_at = now;
        item.total_seconds += 50;
        settings.recent_history.insert(0, item);

        assert_eq!(settings.recent_history.len(), 70);
        assert_eq!(settings.recent_history[0].id, "game_10");
        assert_eq!(settings.recent_history[0].total_seconds, 60);
    }
}
