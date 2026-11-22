import React from "react";
import { TabType } from "../types";
import { Gamepad2, Star, Clock } from "lucide-react";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  allCount: number;
  favoritesCount: number;
  historyCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  allCount,
  favoritesCount,
  historyCount,
}) => {
  const tabs = [
    {
      id: "all" as TabType,
      label: "All Games",
      icon: Gamepad2,
      count: allCount,
    },
    {
      id: "favorites" as TabType,
      label: "Favorites",
      icon: Star,
      count: favoritesCount,
    },
    {
      id: "history" as TabType,
      label: "Recently Played",
      icon: Clock,
      count: historyCount,
    },
  ];

  return (
    <div className="px-3.5 pt-2 border-b border-[#2C2C2E] bg-[#161618] flex items-center gap-1 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-semibold transition-all ${
              isActive
                ? "border-[#00AAFF] text-[#00AAFF] bg-[#1F1F22]/70 rounded-t-md"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#1C1C1E] rounded-t-md"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#00AAFF]" : "text-gray-400"}`} />
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive
                  ? "bg-[#00AAFF]/20 text-[#00AAFF]"
                  : "bg-[#252525] text-gray-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
