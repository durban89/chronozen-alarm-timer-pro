import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  activeAlarmsCount: number;
  isTimerRunning: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeAlarmsCount,
  onToggleSound,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !settings.timeFormat24h,
      };
      setCurrentTime(now.toLocaleTimeString([], options));
      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.timeFormat24h]);

  return (
    <header className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 border border-emerald-500/30 flex items-center justify-center bg-slate-950">
          <img
            src="/icon/48.png"
            alt="ChronoZen Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            ChronoZen
            {activeAlarmsCount > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activeAlarmsCount} active
              </span>
            )}
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">{currentDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="text-right">
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 bg-slate-800/90 px-2 py-1 rounded-md border border-slate-700/60 shadow-inner">
            {currentTime}
          </span>
        </div>

        <button
          onClick={onToggleSound}
          title={settings.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          className={`p-1.5 rounded-lg border transition-all ${
            settings.soundEnabled
              ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              : 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30'
          }`}
        >
          {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
