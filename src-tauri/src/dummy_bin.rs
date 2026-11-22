use std::path::PathBuf;

pub fn get_dummy_executable_path() -> Result<PathBuf, String> {
    let current_exe = std::env::current_exe().map_err(|e| format!("Failed to get current exe path: {}", e))?;
    let exe_dir = current_exe.parent().ok_or("Failed to get parent directory")?;

    let candidate_sibling = exe_dir.join("dummy.exe");
    if candidate_sibling.exists() {
        return Ok(candidate_sibling);
    }

    let resource_candidate = exe_dir.join("resources").join("dummy.exe");
    if resource_candidate.exists() {
        return Ok(resource_candidate);
    }

    // In dev mode, check target/debug or target/release
    let dev_candidate = exe_dir.join("../dummy.exe");
    if dev_candidate.exists() {
        return Ok(dev_candidate);
    }

    // Check LocalAppData
    if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
        let app_dummy = PathBuf::from(local_app_data)
            .join("DiscordGameSwitcher")
            .join("bin")
            .join("dummy.exe");
        if app_dummy.exists() {
            return Ok(app_dummy);
        }
    }

    // If still not found, fallback to candidate_sibling path
    Ok(candidate_sibling)
}
