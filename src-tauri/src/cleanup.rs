use std::path::PathBuf;

pub fn get_runtime_root() -> PathBuf {
    std::env::temp_dir().join("dgs_runtime")
}

pub fn clean_app_runtime(app_id: &str) {
    let app_dir = get_runtime_root().join(app_id);
    if app_dir.exists() {
        let _ = std::fs::remove_dir_all(&app_dir);
    }
}

pub fn sweep_all_runtime() {
    let root = get_runtime_root();
    if root.exists() {
        let _ = std::fs::remove_dir_all(&root);
    }
}
