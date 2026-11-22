import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
}) => {
  const isSm = size === "sm";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none ${
        isSm ? "w-9 h-5" : "w-11 h-6"
      } ${
        checked
          ? "bg-[#00AAFF] shadow-[0_0_10px_rgba(0,170,255,0.4)]"
          : "bg-[#2C2C2E] hover:bg-[#38383A]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          isSm ? "w-3.5 h-3.5" : "w-4 h-4"
        } ${
          checked
            ? isSm
              ? "translate-x-4"
              : "translate-x-6"
            : isSm
            ? "translate-x-1"
            : "translate-x-1"
        }`}
      />
    </button>
  );
};
