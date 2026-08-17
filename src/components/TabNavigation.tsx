import React from 'react';
import { AlarmClock, Hourglass, Settings2, Timer } from 'lucide-react';

export type ActiveTab = 'alarms' | 'timer' | 'stopwatch' | 'settings';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  activeAlarmsCount: number;
  isTimerRunning: boolean;
  isStopwatchRunning: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onChangeTab,
  activeAlarmsCount,
  isTimerRunning,
  isStopwatchRunning,
}) => {
  const tabs = [
    {
      id: 'alarms' as ActiveTab,
      label: 'Alarms',
      icon: AlarmClock,
      badge: activeAlarmsCount > 0 ? activeAlarmsCount : null,
    },
    {
      id: 'timer' as ActiveTab,
      label: 'Timer',
      icon: Hourglass,
      indicator: isTimerRunning,
    },
    {
      id: 'stopwatch' as ActiveTab,
      label: 'Stopwatch',
      icon: Timer,
      indicator: isStopwatchRunning,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings2,
    },
  ];

  return (
    <nav className="flex items-center justify-around bg-slate-900/95 border-b border-slate-800 px-2 py-1.5 backdrop-blur-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-emerald-400 bg-slate-800/80 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-1 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
              {tab.indicator && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>

            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
