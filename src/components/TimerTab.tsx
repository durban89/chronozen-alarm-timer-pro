import React, { useEffect, useState } from 'react';
import { Pause, Play, Plus, RotateCcw, Sparkles } from 'lucide-react';
import type { SoundType, TimerPreset, TimerState } from '../types';
import { formatSeconds } from '../utils/time';

interface TimerTabProps {
  timer: TimerState;
  onStartTimer: (totalSeconds: number, label: string, sound: SoundType) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onAddExtraSeconds: (seconds: number) => void;
}

const PRESETS: TimerPreset[] = [
  { id: 'p1', label: '1 min', minutes: 1 },
  { id: 'p5', label: '5m Break', minutes: 5 },
  { id: 'p15', label: '15m Nap', minutes: 15 },
  { id: 'p25', label: '25m Pomodoro', minutes: 25 },
  { id: 'p45', label: '45m Deep Work', minutes: 45 },
  { id: 'p60', label: '60m Focus', minutes: 60 },
];

export const TimerTab: React.FC<TimerTabProps> = ({
  timer,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onAddExtraSeconds,
}) => {
  const [customHours, setCustomHours] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState<number>(25);
  const [customSeconds, setCustomSeconds] = useState<number>(0);
  const [label, setLabel] = useState<string>(timer.label || 'Focus Session');
  const [sound] = useState<SoundType>(timer.sound || 'gentle_chime');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Sync state if timer totalSeconds changes
  useEffect(() => {
    if (!timer.isRunning && !timer.isPaused) {
      const h = Math.floor(timer.totalSeconds / 3600);
      const m = Math.floor((timer.totalSeconds % 3600) / 60);
      const s = timer.totalSeconds % 60;
      setCustomHours(h);
      setCustomMinutes(m);
      setCustomSeconds(s);
      setLabel(timer.label);
    }
  }, [timer.totalSeconds, timer.isRunning, timer.isPaused, timer.label]);

  const handleSelectPreset = (preset: TimerPreset) => {
    const secs = preset.minutes * 60;
    setCustomHours(0);
    setCustomMinutes(preset.minutes);
    setCustomSeconds(0);
    setLabel(preset.label);
    setIsCustomMode(false);
    onStartTimer(secs, preset.label, sound);
  };

  const handleCustomStart = () => {
    const total = customHours * 3600 + customMinutes * 60 + customSeconds;
    if (total <= 0) return;
    onStartTimer(total, label || 'Focus Session', sound);
  };

  // SVG circular progress calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = timer.totalSeconds > 0 ? (timer.remainingSeconds / timer.totalSeconds) * 100 : 0;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3 items-center justify-between">
      {/* Session Label */}
      <div className="w-full text-center">
        {timer.isRunning || timer.isPaused ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {timer.label || 'Focus Session'}
          </div>
        ) : (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Focus Session Title"
            className="w-full text-center bg-transparent text-xs font-semibold text-slate-300 border-b border-slate-700/60 focus:border-emerald-500 py-1 outline-none transition placeholder:text-slate-500"
          />
        )}
      </div>

      {/* SVG Circular Progress & Time Display */}
      <div className="relative flex items-center justify-center my-1">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800/90"
            fill="transparent"
          />
          {/* Progress Stroke */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-300 ease-linear ${
              timer.remainingSeconds <= 10 && timer.isRunning
                ? 'text-rose-500 shadow-rose-500'
                : 'text-emerald-400 shadow-emerald-500'
            }`}
            fill="transparent"
          />
        </svg>

        {/* Center Digital Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
            {formatSeconds(timer.remainingSeconds)}
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
            {timer.isRunning ? 'Remaining' : timer.isPaused ? 'Paused' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Quick Presets & Custom Configuration */}
      {!timer.isRunning && !timer.isPaused && (
        <div className="w-full space-y-2">
          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className="py-1.5 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 text-slate-300 hover:text-white text-[11px] font-medium transition flex items-center justify-center gap-1 active:scale-95"
              >
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                {p.label}
              </button>
            ))}
          </div>

          {/* Toggle Custom Time Picker */}
          <div className="text-center">
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {isCustomMode ? '▲ Hide Custom Picker' : '▼ Custom Hours / Mins / Secs'}
            </button>
          </div>

          {isCustomMode && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 mb-0.5">H</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={customHours}
                  onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-10 bg-slate-800 text-white font-mono text-center text-xs py-1 rounded border border-slate-700 outline-none"
                />
              </div>
              <span className="text-slate-500 font-bold">:</span>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 mb-0.5">M</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-10 bg-slate-800 text-white font-mono text-center text-xs py-1 rounded border border-slate-700 outline-none"
                />
              </div>
              <span className="text-slate-500 font-bold">:</span>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 mb-0.5">S</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-10 bg-slate-800 text-white font-mono text-center text-xs py-1 rounded border border-slate-700 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extension boost pills while running */}
      {(timer.isRunning || timer.isPaused) && (
        <div className="flex gap-2">
          <button
            onClick={() => onAddExtraSeconds(60)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
          >
            <Plus className="w-3 h-3 text-emerald-400" /> +1 min
          </button>
          <button
            onClick={() => onAddExtraSeconds(300)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
          >
            <Plus className="w-3 h-3 text-emerald-400" /> +5 min
          </button>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="w-full flex items-center gap-2 pt-1">
        {timer.isRunning ? (
          <>
            <button
              onClick={onPauseTimer}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" /> Pause
            </button>
            <button
              onClick={onResetTimer}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        ) : timer.isPaused ? (
          <>
            <button
              onClick={onResumeTimer}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" /> Resume
            </button>
            <button
              onClick={onResetTimer}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={handleCustomStart}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" /> Start Timer
          </button>
        )}
      </div>
    </div>
  );
};
