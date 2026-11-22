import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
  showLabel = false,
}) => {
  const isSm = size === "sm";

  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
    >
      {showLabel && (
        <span
          className={`text-[11px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border transition-all ${
            checked
              ? "bg-[#00AAFF]/20 text-[#00FFFF] border-[#00AAFF]/50 shadow-[0_0_8px_rgba(0,170,255,0.2)]"
              : "bg-[#18181A] text-gray-400 border-[#38383C]"
          }`}
        >
          {checked ? "ON" : "OFF"}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onChange(!checked);
        }}
        className={`relative inline-flex items-center flex-shrink-0 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00AAFF]/40 ${
          isSm ? "w-10 h-5.5" : "w-12 h-6"
        } ${
          checked
            ? "bg-[#00AAFF] border-2 border-[#00AAFF] shadow-[0_0_12px_rgba(0,170,255,0.45)]"
            : "bg-[#141416] border-2 border-[#525256] hover:border-[#727278]"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.5)] transform transition-transform duration-200 ${
            isSm ? "w-3.5 h-3.5" : "w-4 h-4"
          } ${
            checked
              ? isSm
                ? "translate-x-5"
                : "translate-x-6"
              : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};
