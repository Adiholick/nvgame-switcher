use crate::models::GameItem;
use std::path::PathBuf;

const BUNDLED_SNAPSHOT: &str = include_str!("../resources/default_games_snapshot.json");

pub fn get_app_data_dir() -> PathBuf {
    if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
        PathBuf::from(local_app_data).join("DiscordGameSwitcher")
    } else {
        std::env::temp_dir().join("DiscordGameSwitcher")
    }
}

pub fn get_cache_file_path() -> PathBuf {
    get_app_data_dir().join("games_cache.json")
}

pub fn load_cached_games() -> Result<Vec<GameItem>, String> {
    let cache_path = get_cache_file_path();
    if cache_path.exists() {
        if let Ok(content) = std::fs::read_to_string(&cache_path) {
            if let Ok(games) = serde_json::from_str::<Vec<GameItem>>(&content) {
                if !games.is_empty() {
                    return Ok(games);
                }
            }
        }
    }

    // Instant cold-start fallback from embedded snapshot
    let games: Vec<GameItem> = serde_json::from_str(BUNDLED_SNAPSHOT)
        .map_err(|e| format!("Failed to parse bundled snapshot: {}", e))?;

    // Asynchronously or eagerly write to disk cache so subsequent reads can use it
    let _ = save_cached_games(&games);

    Ok(games)
}

pub fn save_cached_games(games: &[GameItem]) -> Result<(), String> {
    let cache_path = get_cache_file_path();
    if let Some(parent) = cache_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create cache directory: {}", e))?;
    }
    let json_data = serde_json::to_string(games).map_err(|e| format!("Failed to serialize games: {}", e))?;
    std::fs::write(&cache_path, json_data).map_err(|e| format!("Failed to write cache file: {}", e))?;
    Ok(())
}
