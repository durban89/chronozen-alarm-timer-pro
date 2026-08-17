export type RepeatMode = 'once' | 'daily' | 'weekdays' | 'weekends' | 'custom';

export type SoundType = 'zen_bell' | 'gentle_chime' | 'digital_beep' | 'radar' | 'marimba';

export interface AlarmItem {
  id: string;
  time: string; // "HH:mm" (24-hour format stored)
  label: string;
  enabled: boolean;
  repeat: RepeatMode;
  customDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  sound: SoundType;
  volume: number; // 0 to 100
  snoozeMinutes: number; // e.g. 5, 10, 15
  createdAt: number;
  nextTriggerTime?: number;
}

export interface TimerPreset {
  id: string;
  label: string;
  minutes: number;
}

export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  label: string;
  sound: SoundType;
  targetTimestamp?: number;
}

export interface StopwatchLap {
  id: number;
  lapTime: number; // in milliseconds
  totalTime: number; // in milliseconds
}

export interface StopwatchState {
  elapsedTime: number; // in milliseconds
  isRunning: boolean;
  startTime?: number;
  laps: StopwatchLap[];
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  timeFormat24h: boolean;
  defaultSound: SoundType;
  masterVolume: number; // 0 to 100
  soundEnabled: boolean;
  autoDismissSeconds: number;
}

export interface RingingEvent {
  id: string;
  type: 'alarm' | 'timer';
  title: string;
  sound: SoundType;
  volume: number;
  timestamp: number;
  snoozeMinutes?: number;
}
