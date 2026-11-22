use crate::models::ActiveSession;
use std::path::PathBuf;
use std::process::Child;
use std::sync::Mutex;
use std::time::Instant;

pub struct RunningGame {
    pub session: ActiveSession,
    pub child: Child,
    pub start_instant: Instant,
}

pub struct AppState {
    pub active_game: Mutex<Option<RunningGame>>,
    pub dummy_path: PathBuf,
}

impl AppState {
    pub fn new(dummy_path: PathBuf) -> Self {
        Self {
            active_game: Mutex::new(None),
            dummy_path,
        }
    }
}
