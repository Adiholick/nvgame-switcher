#![windows_subsystem = "windows"]

#[cfg(target_os = "windows")]
use std::ffi::OsStr;
#[cfg(target_os = "windows")]
use std::os::windows::ffi::OsStrExt;
#[cfg(target_os = "windows")]
use windows_sys::Win32::Foundation::HWND;
#[cfg(target_os = "windows")]
use windows_sys::Win32::UI::WindowsAndMessaging::{
    CreateWindowExW, DefWindowProcW, DispatchMessageW, GetMessageW, PostQuitMessage,
    RegisterClassW, ShowWindow, TranslateMessage, MSG, SW_SHOWNOACTIVATE,
    WNDCLASSW, WS_OVERLAPPEDWINDOW, WM_DESTROY,
};

#[cfg(target_os = "windows")]
unsafe extern "system" fn window_proc(
    hwnd: HWND,
    msg: u32,
    wparam: usize,
    lparam: isize,
) -> isize {
    if msg == WM_DESTROY {
        PostQuitMessage(0);
        return 0;
    }
    DefWindowProcW(hwnd, msg, wparam, lparam)
}

#[cfg(target_os = "windows")]
fn to_wide(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(Some(0)).collect()
}

fn main() {
    #[cfg(target_os = "windows")]
    unsafe {
        // Read window title from arguments (e.g. game name)
        let args: Vec<String> = std::env::args().collect();
        let title = if args.len() > 1 {
            args[1..].join(" ")
        } else {
            "Game Activity Simulation".to_string()
        };

        let class_name = to_wide("NVGameWindowHost");
        let window_title = to_wide(&title);

        let wnd_class = WNDCLASSW {
            style: 0,
            lpfnWndProc: Some(window_proc),
            cbClsExtra: 0,
            cbWndExtra: 0,
            hInstance: 0 as _,
            hIcon: 0 as _,
            hCursor: 0 as _,
            hbrBackground: 0 as _,
            lpszMenuName: std::ptr::null(),
            lpszClassName: class_name.as_ptr(),
        };

        RegisterClassW(&wnd_class);

        // Create top-level visible window positioned off-screen (-32000, -32000)
        // Discord's game scanner relies on EnumWindows & IsWindowVisible to detect running games!
        let hwnd = CreateWindowExW(
            0,
            class_name.as_ptr(),
            window_title.as_ptr(),
            WS_OVERLAPPEDWINDOW,
            -32000,
            -32000,
            100,
            100,
            0 as _,
            0 as _,
            0 as _,
            std::ptr::null(),
        );

        if hwnd != 0 as _ {
            ShowWindow(hwnd, SW_SHOWNOACTIVATE);
        }

        // Standard Win32 message pump: GetMessage blocks when queue is idle (0% CPU)
        let mut msg: MSG = std::mem::zeroed();
        while GetMessageW(&mut msg, 0 as _, 0, 0) > 0 {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
    }

    #[cfg(not(target_os = "windows"))]
    loop {
        std::thread::park();
    }
}
