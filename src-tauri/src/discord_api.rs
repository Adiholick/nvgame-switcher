use crate::models::GameItem;
use serde::Deserialize;

#[derive(Deserialize)]
struct RawExecutable {
    name: Option<String>,
    os: Option<String>,
}

#[derive(Deserialize)]
struct RawDiscordApp {
    id: Option<serde_json::Value>,
    name: Option<String>,
    icon: Option<String>,
    executables: Option<Vec<RawExecutable>>,
}

const GENERIC_EXES: &[&str] = &[
    "javaw.exe",
    "java.exe",
    "cmd.exe",
    "powershell.exe",
    "python.exe",
    "pythonw.exe",
    "node.exe",
    "explorer.exe",
    "chrome.exe",
    "firefox.exe",
];

pub async fn fetch_detectable_games() -> Result<Vec<GameItem>, String> {
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

    let resp = client
        .get("https://discord.com/api/v9/applications/detectable")
        .send()
        .await
        .map_err(|e| format!("Failed to send request to Discord API: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("Discord API returned error status: {}", resp.status()));
    }

    let raw_apps: Vec<RawDiscordApp> = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse Discord API JSON: {}", e))?;

    let mut games = Vec::new();

    for app in raw_apps {
        let app_id = match app.id {
            Some(serde_json::Value::String(s)) => s,
            Some(serde_json::Value::Number(n)) => n.to_string(),
            _ => continue,
        };

        let name = match app.name {
            Some(n) if !n.trim().is_empty() => n.trim().to_string(),
            _ => continue,
        };

        let mut win32_exes = Vec::new();
        let mut is_generic = false;

        if let Some(execs) = app.executables {
            for e in execs {
                if let (Some(os), Some(exe_name)) = (e.os, e.name) {
                    if os == "win32" && !exe_name.trim().is_empty() {
                        let normalized = exe_name.replace('\\', "/").trim().to_string();
                        let base_name = normalized
                            .split('/')
                            .last()
                            .unwrap_or(&normalized)
                            .to_ascii_lowercase();

                        if GENERIC_EXES.contains(&base_name.as_str()) {
                            is_generic = true;
                        }

                        if !win32_exes.contains(&normalized) {
                            win32_exes.push(normalized);
                        }
                    }
                }
            }
        }

        if !win32_exes.is_empty() {
            games.push(GameItem {
                id: app_id,
                name,
                icon: app.icon,
                executables: win32_exes,
                is_generic,
            });
        }
    }

    games.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(games)
}
