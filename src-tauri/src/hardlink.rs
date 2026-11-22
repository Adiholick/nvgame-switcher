use std::path::{Path, PathBuf};

pub fn sanitize_relative_path(path_str: &str) -> PathBuf {
    let clean = path_str.replace('\\', "/");
    let mut parts = Vec::new();
    for part in clean.split('/') {
        let trimmed = part.trim();
        if trimmed.is_empty() || trimmed == "." || trimmed == ".." {
            continue;
        }
        parts.push(trimmed);
    }
    if parts.is_empty() {
        PathBuf::from("game.exe")
    } else {
        parts.iter().collect()
    }
}

pub fn create_hardlink_executable(
    app_id: &str,
    relative_path: &str,
    dummy_exe_path: &Path,
) -> Result<PathBuf, String> {
    let temp_root = std::env::temp_dir().join("dgs_runtime").join(app_id);
    let clean_rel = sanitize_relative_path(relative_path);
    let target_file = temp_root.join(clean_rel);

    if let Some(parent) = target_file.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create directories: {}", e))?;
    }

    if target_file.exists() {
        let _ = std::fs::remove_file(&target_file);
    }

    // Try NTFS hard link first (0 bytes disk usage, instant)
    if let Err(e) = std::fs::hard_link(dummy_exe_path, &target_file) {
        // Fallback to copy if on different drives/volumes
        std::fs::copy(dummy_exe_path, &target_file)
            .map_err(|copy_err| format!("Hardlink failed ({}) and copy failed: {}", e, copy_err))?;
    }

    Ok(target_file)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_relative_path() {
        assert_eq!(
            sanitize_relative_path("game/bin/win64/cs2.exe"),
            PathBuf::from("game/bin/win64/cs2.exe")
        );
        assert_eq!(
            sanitize_relative_path("..\\..\\windows\\system32\\cmd.exe"),
            PathBuf::from("windows/system32/cmd.exe")
        );
        assert_eq!(
            sanitize_relative_path("///var/test/run.exe"),
            PathBuf::from("var/test/run.exe")
        );
        assert_eq!(sanitize_relative_path(""), PathBuf::from("game.exe"));
    }
}
