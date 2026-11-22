import React from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import { Minus, Square, X, Gamepad2 } from "lucide-react";

export const TitleBar: React.FC = () => {
  const appWindow = getCurrentWebviewWindow();

  const handleMinimize = async () => {
    try {
      await appWindow.minimize();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMaximize = async () => {
    try {
      await appWindow.toggleMaximize();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = async () => {
    try {
      await invoke("handle_window_close");
    } catch (e) {
      console.error(e);
      // Fallback
      await appWindow.close();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-[#141416]/90 border-b border-[#2C2C2E] flex items-center justify-between px-3 select-none flex-shrink-0"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <div className="w-5 h-5 rounded-md bg-[#00AAFF]/20 flex items-center justify-center text-[#00AAFF]">
          <Gamepad2 className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold text-gray-200 tracking-wide">
          NVGame Switcher
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252525] text-gray-400 font-mono">
          v1.0
        </span>
      </div>

      <div className="flex items-center">
        <button
          onClick={handleMinimize}
          className="h-10 w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-10 w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="h-10 w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#FF453A] transition-colors"
          title="Close (Minimize to Tray)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
