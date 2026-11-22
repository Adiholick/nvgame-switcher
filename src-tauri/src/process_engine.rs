use std::path::Path;
use std::process::{Child, Command};

pub fn spawn_dummy_process(target_exe: &Path, game_name: &str) -> Result<Child, String> {
    let mut cmd = Command::new(target_exe);
    cmd.arg(game_name);

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let child = cmd
        .spawn()
        .map_err(|e| format!("Failed to spawn process {:?}: {}", target_exe, e))?;
    Ok(child)
}

pub fn kill_process(mut child: Child) -> Result<(), String> {
    let _ = child.kill();
    let _ = child.wait();
    Ok(())
}
