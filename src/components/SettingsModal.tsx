import React, { useState, useEffect } from "react";
import { AppSettings } from "../types";
import {
  X,
  Layers,
  Trash2,
  HardDrive,
  Minimize2,
  ShieldCheck,
  Bell,
  Clock,
  Shuffle,
  Sparkles,
  Timer,
} from "lucide-react";
import { ToggleSwitch } from "./common/ToggleSwitch";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  unplayedCount?: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  unplayedCount,
}) => {
  if (!isOpen) return null;

  const [minMinStr, setMinMinStr] = useState<string>(
    String(settings.auto_switch_min_minutes ?? 7)
  );
  const [maxMinStr, setMaxMinStr] = useState<string>(
    String(settings.auto_switch_max_minutes ?? 20)
  );

  useEffect(() => {
    setMinMinStr(String(settings.auto_switch_min_minutes ?? 7));
    setMaxMinStr(String(settings.auto_switch_max_minutes ?? 20));
  }, [settings.auto_switch_min_minutes, settings.auto_switch_max_minutes]);

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

  const handleToggleUnplayedOnly = (val: boolean) => {
    onUpdateSettings({
      ...settings,
      auto_switch_unplayed_only: val,
    });
  };

  const handleMinMinutesChange = (valStr: string) => {
    setMinMinStr(valStr);
    const num = parseInt(valStr, 10);
    if (!isNaN(num) && num >= 1) {
      onUpdateSettings({
        ...settings,
        auto_switch_min_minutes: num,
      });
    }
  };

  const handleMinMinutesBlur = () => {
    const minVal = Math.max(1, parseInt(minMinStr, 10) || 1);
    const currentMax = settings.auto_switch_max_minutes ?? 20;
    const maxVal = Math.max(minVal, currentMax);
    setMinMinStr(String(minVal));
    setMaxMinStr(String(maxVal));
    onUpdateSettings({
      ...settings,
      auto_switch_min_minutes: minVal,
      auto_switch_max_minutes: maxVal,
    });
  };

  const handleMaxMinutesChange = (valStr: string) => {
    setMaxMinStr(valStr);
    const num = parseInt(valStr, 10);
    if (!isNaN(num) && num >= 1) {
      onUpdateSettings({
        ...settings,
        auto_switch_max_minutes: num,
      });
    }
  };

  const handleMaxMinutesBlur = () => {
    const currentMin = settings.auto_switch_min_minutes ?? 7;
    const maxVal = Math.max(currentMin, parseInt(maxMinStr, 10) || currentMin);
    setMaxMinStr(String(maxVal));
    onUpdateSettings({
      ...settings,
      auto_switch_min_minutes: currentMin,
      auto_switch_max_minutes: maxVal,
    });
  };

  const handleToggleNotifyAutoSwitch = (val: boolean) => {
    if (val && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#1C1C1E] border border-[#38383A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Section: Auto Switch Mode */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00AAFF] uppercase tracking-wider px-1">
              <Shuffle className="w-3.5 h-3.5" />
              <span>Auto Switch Mode Configuration</span>
            </div>

            {/* Auto Switch: Switch Unplayed Game */}
            <div
              onClick={() =>
                handleToggleUnplayedOnly(!settings.auto_switch_unplayed_only)
              }
              className="p-3.5 rounded-xl bg-[#252525] hover:bg-[#2A2A2E] border border-[#38383C] hover:border-[#48484E] flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#1C1C1E] border border-[#333336] text-[#00AAFF] group-hover:border-[#00AAFF]/40 transition-colors mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                      Switch Unplayed Game
                    </span>
                    {unplayedCount !== undefined && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-[#00AAFF]/15 text-[#00FFFF] border border-[#00AAFF]/30">
                        {unplayedCount} unplayed
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Auto Switch hanya memilih game yang belum pernah dimainkan
                    (belum ada pada tab Recently Played).
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ToggleSwitch
                  checked={!!settings.auto_switch_unplayed_only}
                  onChange={handleToggleUnplayedOnly}
                  showLabel={true}
                />
              </div>
            </div>

            {/* Auto Switch: Interval Random Minutes */}
            <div className="p-3.5 rounded-xl bg-[#252525] border border-[#38383C] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#1C1C1E] border border-[#333336] text-[#00AAFF]">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-200">
                      Auto Switch Interval (Menit)
                    </span>
                    <span className="text-xs text-gray-400">
                      Tentukan rentang menit acak sebelum berganti game berikutnya.
                    </span>
                  </div>
                </div>
              </div>

              {/* Min & Max Minute Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-[#191919] border border-[#333336] flex flex-col gap-1.5 focus-within:border-[#00AAFF] transition-colors">
                  <label className="text-[11px] font-semibold text-gray-400">
                    Random Minimal Minute
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={settings.auto_switch_max_minutes ?? 20}
                      value={minMinStr}
                      onChange={(e) => handleMinMinutesChange(e.target.value)}
                      onBlur={handleMinMinutesBlur}
                      className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                    />
                    <span className="text-xs text-gray-500 font-mono">min</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#191919] border border-[#333336] flex flex-col gap-1.5 focus-within:border-[#00AAFF] transition-colors">
                  <label className="text-[11px] font-semibold text-gray-400">
                    Random Maximal Minute
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={settings.auto_switch_min_minutes ?? 7}
                      max={1440}
                      value={maxMinStr}
                      onChange={(e) => handleMaxMinutesChange(e.target.value)}
                      onBlur={handleMaxMinutesBlur}
                      className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                    />
                    <span className="text-xs text-gray-500 font-mono">min</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 flex items-center justify-between px-0.5">
                <span>
                  Game akan berganti acak antara{" "}
                  <strong className="text-gray-300 font-mono">
                    {settings.auto_switch_min_minutes ?? 7}
                  </strong>{" "}
                  s/d{" "}
                  <strong className="text-gray-300 font-mono">
                    {settings.auto_switch_max_minutes ?? 20}
                  </strong>{" "}
                  menit.
                </span>
              </div>
            </div>

            {/* Auto Switch: Notifikasi */}
            <div
              onClick={() =>
                handleToggleNotifyAutoSwitch(
                  !(settings.notify_on_auto_switch ?? true)
                )
              }
              className="p-3.5 rounded-xl bg-[#252525] hover:bg-[#2A2A2E] border border-[#38383C] hover:border-[#48484E] flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#1C1C1E] border border-[#333336] text-[#00AAFF] group-hover:border-[#00AAFF]/40 transition-colors mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                    Notifikasi Auto Switch
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Tampilkan notifikasi desktop saat sistem otomatis berpindah ke
                    game berikutnya.
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ToggleSwitch
                  checked={settings.notify_on_auto_switch ?? true}
                  onChange={handleToggleNotifyAutoSwitch}
                  showLabel={true}
                />
              </div>
            </div>
          </div>

          {/* Section: General / System */}
          <div className="space-y-2.5 pt-2 border-t border-[#2C2C2E]">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              <Layers className="w-3.5 h-3.5" />
              <span>System & Process</span>
            </div>

            {/* Switch: Minimize to System Tray */}
            <div
              onClick={() =>
                handleToggleMinimizeToTray(!settings.minimize_to_tray_on_close)
              }
              className="p-3.5 rounded-xl bg-[#252525] hover:bg-[#2A2A2E] border border-[#38383C] hover:border-[#48484E] flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#1C1C1E] border border-[#333336] text-[#00AAFF] group-hover:border-[#00AAFF]/40 transition-colors mt-0.5">
                  <Minimize2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                    Minimize to System Tray
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Menutup jendela (X) akan menyembunyikan aplikasi ke System Tray
                    sementara simulasi tetap berjalan.
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ToggleSwitch
                  checked={settings.minimize_to_tray_on_close}
                  onChange={handleToggleMinimizeToTray}
                  showLabel={true}
                />
              </div>
            </div>

            {/* Switch: Auto Cleanup on Exit */}
            <div
              onClick={() =>
                handleToggleAutoCleanup(!settings.auto_cleanup_on_exit)
              }
              className="p-3.5 rounded-xl bg-[#252525] hover:bg-[#2A2A2E] border border-[#38383C] hover:border-[#48484E] flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#1C1C1E] border border-[#333336] text-[#00AAFF] group-hover:border-[#00AAFF]/40 transition-colors mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                    Auto Cleanup on Exit
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Hentikan seluruh proses game dan bersihkan direktori
                    %TEMP%\dgs_runtime saat aplikasi ditutup.
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <ToggleSwitch
                  checked={settings.auto_cleanup_on_exit}
                  onChange={handleToggleAutoCleanup}
                  showLabel={true}
                />
              </div>
            </div>

            {/* Clear History */}
            <div className="p-3.5 rounded-xl bg-[#252525] border border-[#333336] flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#1C1C1E] border border-[#333336] text-gray-400 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-200">
                    Recently Played History
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">
                    {settings.recent_history.length} seluruh game pernah dimainkan
                    tersimpan.
                  </span>
                </div>
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
                Executable dihubungkan via NTFS Hardlink ke %TEMP%\dgs_runtime dengan
                0 byte penggunaan disk. Proses dummy berjalan senyap tanpa beban CPU.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#2C2C2E] bg-[#161618] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-[#00AAFF] hover:bg-[#00C3FF] text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
