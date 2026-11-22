import React from "react";
import { AppSettings } from "../types";
import { X, Layers, Trash2, HardDrive } from "lucide-react";
import { ToggleSwitch } from "./common/ToggleSwitch";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleToggleMinimizeToTray = (val: boolean) => {
    onUpdateSettings({
      ...settings,
      minimize_to_tray_on_close: val,
    });
  };

  const handleToggleAutoCleanup = (val: boolean) => {
    onUpdateSettings({
      ...settings,
      auto_cleanup_on_exit: val,
    });
  };

  const handleToggleNotifyAutoSwitch = (val: boolean) => {
    onUpdateSettings({
      ...settings,
      notify_on_auto_switch: val,
    });
  };

  const handleClearHistory = () => {
    onUpdateSettings({
      ...settings,
      recent_history: [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1C1C1E] border border-[#38383A] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#2C2C2E] flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00AAFF]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Preferences & Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Switch 1: Minimize to System Tray */}
          <div className="p-3.5 rounded-xl bg-[#252525] border border-[#333336] flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">
                Minimize to System Tray
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                Clicking the Close (X) button hides the window to the Windows 11
                System Tray while simulations continue.
              </span>
            </div>
            <ToggleSwitch
              checked={settings.minimize_to_tray_on_close}
              onChange={handleToggleMinimizeToTray}
            />
          </div>

          {/* Switch 2: Auto Cleanup on Exit */}
          <div className="p-3.5 rounded-xl bg-[#252525] border border-[#333336] flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">
                Auto Cleanup on Exit
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                Ensure all dummy child processes are killed and %TEMP%\dgs_runtime
                is wiped clean when quitting.
              </span>
            </div>
            <ToggleSwitch
              checked={settings.auto_cleanup_on_exit}
              onChange={handleToggleAutoCleanup}
            />
          </div>

          {/* Switch 3: Notify on Auto Switch */}
          <div className="p-3.5 rounded-xl bg-[#252525] border border-[#333336] flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">
                Notifikasi Auto Switch
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                Tampilkan notifikasi desktop ketika sistem otomatis berganti ke game acak berikutnya.
              </span>
            </div>
            <ToggleSwitch
              checked={settings.notify_on_auto_switch ?? true}
              onChange={handleToggleNotifyAutoSwitch}
            />
          </div>

          {/* Clear History */}
          <div className="p-3.5 rounded-xl bg-[#252525] border border-[#333336] flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-200">
                Recent History
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                {settings.recent_history.length} games recorded in recent history.
              </span>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={settings.recent_history.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                settings.recent_history.length === 0
                  ? "bg-[#1E1E20] border-[#2C2C2E] text-gray-600 cursor-not-allowed"
                  : "bg-[#FF453A]/10 border-[#FF453A]/30 text-[#FF453A] hover:bg-[#FF453A] hover:text-white"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* App Info Box */}
          <div className="p-3.5 rounded-xl bg-[#141416] border border-[#28282A] space-y-1.5 text-xs text-gray-400">
            <div className="flex items-center gap-2 text-gray-300 font-semibold">
              <HardDrive className="w-3.5 h-3.5 text-[#00AAFF]" />
              <span>Zero-Clutter NTFS Engine</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500">
              Executables are linked via NTFS Hardlinks into %TEMP%\dgs_runtime with
              0 byte disk allocation. Child processes run silently with 0% CPU.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#2C2C2E] bg-[#161618] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#00AAFF] hover:bg-[#00C3FF] text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
