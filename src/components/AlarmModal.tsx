import React, { useState } from 'react';
import { Bell, Play, Repeat, Volume2, X } from 'lucide-react';
import type { AlarmItem, RepeatMode, SoundType } from '../types';
import { audioSynth } from '../utils/audio';
import { DAY_NAMES_SHORT } from '../utils/time';

interface AlarmModalProps {
  alarm?: AlarmItem | null;
  onSave: (alarm: AlarmItem) => void;
  onClose: () => void;
  is24h: boolean;
}

const SOUND_OPTIONS: { id: SoundType; label: string }[] = [
  { id: 'zen_bell', label: 'Zen Tibetan Bell' },
  { id: 'gentle_chime', label: 'Gentle Chime' },
  { id: 'digital_beep', label: 'Classic Digital' },
  { id: 'radar', label: 'Radar Alert' },
  { id: 'marimba', label: 'Marimba Melody' },
];

const PRESET_LABELS = ['Morning Standup', 'Focus Session', 'Drink Water', 'Take Medicine', 'Workout', 'Market Close'];

export const AlarmModal: React.FC<AlarmModalProps> = ({ alarm, onSave, onClose }) => {
  const initialTime = alarm?.time || '08:00';
  const [hours, setHours] = useState<string>(initialTime.split(':')[0] || '08');
  const [minutes, setMinutes] = useState<string>(initialTime.split(':')[1] || '00');
  const [label, setLabel] = useState<string>(alarm?.label || '');
  const [repeat, setRepeat] = useState<RepeatMode>(alarm?.repeat || 'weekdays');
  const [customDays, setCustomDays] = useState<number[]>(alarm?.customDays || [1, 2, 3, 4, 5]);
  const [sound, setSound] = useState<SoundType>(alarm?.sound || 'zen_bell');
  const [volume, setVolume] = useState<number>(alarm?.volume ?? 85);
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(alarm?.snoozeMinutes ?? 5);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  const toggleDay = (dayIndex: number) => {
    if (customDays.includes(dayIndex)) {
      setCustomDays(customDays.filter((d) => d !== dayIndex));
    } else {
      setCustomDays([...customDays, dayIndex].sort());
    }
  };

  const handlePreviewSound = () => {
    setIsPlayingPreview(true);
    audioSynth.playSingleTone(sound, volume);
    setTimeout(() => setIsPlayingPreview(false), 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');

    const newAlarm: AlarmItem = {
      id: alarm?.id || `alarm-${Date.now()}`,
      time: `${formattedHours}:${formattedMinutes}`,
      label: label.trim() || 'Alarm',
      enabled: true,
      repeat,
      customDays: repeat === 'custom' ? customDays : repeat === 'weekdays' ? [1, 2, 3, 4, 5] : repeat === 'weekends' ? [0, 6] : [],
      sound,
      volume,
      snoozeMinutes,
      createdAt: alarm?.createdAt || Date.now(),
    };

    onSave(newAlarm);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Bell className="w-4 h-4 text-emerald-400" />
            {alarm ? 'Edit Alarm' : 'New Alarm'}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto text-xs">
          {/* Time Picker */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="bg-slate-800 text-white font-mono text-2xl font-bold rounded-lg px-2 py-1 border border-slate-700 focus:border-emerald-500 outline-none text-center cursor-pointer"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const val = i.toString().padStart(2, '0');
                  return (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
              <span className="text-white text-2xl font-bold font-mono animate-pulse">:</span>
              <select
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="bg-slate-800 text-white font-mono text-2xl font-bold rounded-lg px-2 py-1 border border-slate-700 focus:border-emerald-500 outline-none text-center cursor-pointer"
              >
                {Array.from({ length: 60 }).map((_, i) => {
                  const val = i.toString().padStart(2, '0');
                  return (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Label Input & Preset chips */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center justify-between">
              <span>Label</span>
              <span className="text-[10px] text-slate-500">Optional</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Daily Standup"
              className="w-full bg-slate-800/90 text-white border border-slate-700 rounded-lg px-3 py-2 text-xs focus:border-emerald-500 outline-none transition placeholder:text-slate-500"
            />
            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {PRESET_LABELS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setLabel(p)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat Schedule */}
          <div className="space-y-2">
            <label className="text-slate-300 font-medium flex items-center gap-1">
              <Repeat className="w-3 h-3 text-emerald-400" />
              Repeat Schedule
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['once', 'daily', 'weekdays', 'weekends', 'custom'] as RepeatMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRepeat(mode)}
                  className={`py-1.5 px-2 rounded-lg border capitalize text-[11px] font-medium transition ${
                    repeat === mode
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-semibold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Custom Day Selector */}
            {repeat === 'custom' && (
              <div className="flex justify-between gap-1 pt-1.5 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                {DAY_NAMES_SHORT.map((name, idx) => {
                  const isSelected = customDays.includes(idx);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`w-7 h-7 rounded-full text-[10px] font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {name[0]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sound & Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-emerald-400" />
                Ringtone Sound
              </label>
              <button
                type="button"
                onClick={handlePreviewSound}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                {isPlayingPreview ? 'Playing...' : 'Test Sound'}
              </button>
            </div>
            <select
              value={sound}
              onChange={(e) => setSound(e.target.value as SoundType)}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:border-emerald-500 outline-none"
            >
              {SOUND_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Volume slider */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400 w-12">Volume: {volume}%</span>
              <input
                type="range"
                min="10"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Snooze Duration */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300 font-medium">Snooze Duration</span>
            <select
              value={snoozeMinutes}
              onChange={(e) => setSnoozeMinutes(Number(e.target.value))}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-md px-2 py-1 text-[11px] focus:border-emerald-500 outline-none"
            >
              <option value={3}>3 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 transition"
            >
              Save Alarm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
