pub mod cache;
pub mod cleanup;
pub mod discord_api;
pub mod dummy_bin;
pub mod hardlink;
pub mod models;
pub mod process_engine;
pub mod settings;
pub mod state;
pub mod tray;

use chrono::Utc;
use models::{ActiveSession, AppSettings, GameItem};
use state::{AppState, RunningGame};
use std::time::Instant;
use tauri::{AppHandle, Emitter, Listener, Manager, State, Window};

#[tauri::command]
fn get_games() -> Result<Vec<GameItem>, String> {
    cache::load_cached_games()
}

#[tauri::command]
async fn sync_games() -> Result<Vec<GameItem>, String> {
    let fresh_games = discord_api::fetch_detectable_games().await?;
    cache::save_cached_games(&fresh_games)?;
    Ok(fresh_games)
}

#[tauri::command]
fn get_active_session(state: State<'_, AppState>) -> Option<ActiveSession> {
    let mut lock = state.active_game.lock().unwrap();
    if let Some(ref mut running) = *lock {
        // Check if process has exited
        match running.child.try_wait() {
            Ok(Some(_status)) => {
                // Process finished or was killed externally
                let old_app_id = running.session.app_id.clone();
                let duration = running.start_instant.elapsed().as_secs();
                let _ = settings::record_played(&old_app_id, &running.session.game_name, duration);
                cleanup::clean_app_runtime(&old_app_id);
                *lock = None;
                None
            }
            Ok(None) => Some(running.session.clone()),
            Err(_) => {
                *lock = None;
                None
            }
        }
    } else {
        None
    }
}

#[tauri::command]
fn start_simulation(
    app_id: String,
    game_name: String,
    relative_path: String,
    state: State<'_, AppState>,
) -> Result<ActiveSession, String> {
    let mut lock = state.active_game.lock().unwrap();

    // 1. Stop existing game if any (Single Active Mode)
    if let Some(running) = lock.take() {
        let old_app_id = running.session.app_id.clone();
        let duration = running.start_instant.elapsed().as_secs();
        let _ = settings::record_played(&old_app_id, &running.session.game_name, duration);
        let _ = process_engine::kill_process(running.child);
        cleanup::clean_app_runtime(&old_app_id);
    }

    // 2. Prepare hardlink executable in %TEMP%\dgs_runtime\{app_id}
    let target_exe = hardlink::create_hardlink_executable(&app_id, &relative_path, &state.dummy_path)?;

    // 3. Spawn process with game title window for Discord detection
    let child = process_engine::spawn_dummy_process(&target_exe, &game_name)?;
    let pid = child.id();
    let started_at = Utc::now().to_rfc3339();

    // Mark as played immediately in history so it counts as played right away
    let _ = settings::record_played(&app_id, &game_name, 0);

    let session = ActiveSession {
        app_id: app_id.clone(),
        game_name: game_name.clone(),
        executable_path: relative_path,
        started_at,
        pid,
    };

    *lock = Some(RunningGame {
        session: session.clone(),
        child,
        start_instant: Instant::now(),
    });

    Ok(session)
}

#[tauri::command]
fn stop_simulation(state: State<'_, AppState>) -> Result<(), String> {
    let mut lock = state.active_game.lock().unwrap();
    if let Some(running) = lock.take() {
        let old_app_id = running.session.app_id.clone();
        let duration = running.start_instant.elapsed().as_secs();
        let _ = settings::record_played(&old_app_id, &running.session.game_name, duration);
        let _ = process_engine::kill_process(running.child);
        cleanup::clean_app_runtime(&old_app_id);
    }
    Ok(())
}

#[tauri::command]
fn get_settings() -> AppSettings {
    settings::load_settings()
}

#[tauri::command]
fn update_settings(new_settings: AppSettings) -> Result<AppSettings, String> {
    settings::save_settings(&new_settings)?;
    Ok(new_settings)
}

#[tauri::command]
fn toggle_favorite(app_id: String) -> Result<AppSettings, String> {
    settings::toggle_favorite(&app_id)
}

#[tauri::command]
fn handle_window_close(app: AppHandle, window: Window) -> Result<(), String> {
    let current_settings = settings::load_settings();
    if current_settings.minimize_to_tray_on_close {
        let _ = window.hide();
    } else {
        app.exit(0);
    }
    Ok(())
}

pub fn run() {
    // 1. Startup sweep to remove any leftover %TEMP%\dgs_runtime from previous crashes
    cleanup::sweep_all_runtime();

    // 2. Locate or prepare dummy.exe
    let dummy_path = dummy_bin::get_dummy_executable_path()
        .unwrap_or_else(|_| std::env::temp_dir().join("dummy.exe"));

    let app_state = AppState::new(dummy_path);

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .setup(|app| {
            // Setup System Tray
            if let Err(e) = tray::setup_tray(app.handle()) {
                eprintln!("Warning: Failed to setup system tray: {}", e);
            }

            // Listen for tray stop requests
            let handle = app.handle().clone();
            app.listen("tray-stop-requested", move |_| {
                if let Some(state) = handle.try_state::<AppState>() {
                    let mut lock = state.active_game.lock().unwrap();
                    if let Some(running) = lock.take() {
                        let old_app_id = running.session.app_id.clone();
                        let duration = running.start_instant.elapsed().as_secs();
                        let _ = settings::record_played(&old_app_id, &running.session.game_name, duration);
                        let _ = process_engine::kill_process(running.child);
                        cleanup::clean_app_runtime(&old_app_id);
                    }
                }
                let _ = handle.emit("session-stopped", ());
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_games,
            sync_games,
            get_active_session,
            start_simulation,
            stop_simulation,
            get_settings,
            update_settings,
            toggle_favorite,
            handle_window_close,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|app_handle, event| {
        if let tauri::RunEvent::ExitRequested { .. } = event {
            // Cleanup on graceful exit
            if let Some(state) = app_handle.try_state::<AppState>() {
                let mut lock = state.active_game.lock().unwrap();
                if let Some(running) = lock.take() {
                    let old_app_id = running.session.app_id.clone();
                    let duration = running.start_instant.elapsed().as_secs();
                    let _ = settings::record_played(&old_app_id, &running.session.game_name, duration);
                    let _ = process_engine::kill_process(running.child);
                }
            }
            cleanup::sweep_all_runtime();
        }
    });
}
