import type { AlarmItem, AppSettings, RingingEvent, StopwatchState, TimerState } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  timeFormat24h: false,
  defaultSound: 'zen_bell',
  masterVolume: 85,
  soundEnabled: true,
  autoDismissSeconds: 60,
};

export const DEFAULT_TIMER: TimerState = {
  totalSeconds: 25 * 60, // 25 min default Pomodoro
  remainingSeconds: 25 * 60,
  isRunning: false,
  isPaused: false,
  label: 'Focus Session',
  sound: 'gentle_chime',
};

export const DEFAULT_STOPWATCH: StopwatchState = {
  elapsedTime: 0,
  isRunning: false,
  laps: [],
};

const STORAGE_KEYS = {
  ALARMS: 'chronozen_alarms',
  TIMER: 'chronozen_timer',
  STOPWATCH: 'chronozen_stopwatch',
  SETTINGS: 'chronozen_settings',
  RINGING: 'chronozen_ringing',
};

// Cross-environment storage helper (Chrome / Firefox / Web Extension API or Fallback)
export async function getStoredData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get(key);
      return result[key] !== undefined ? result[key] : defaultValue;
    }
  } catch {
    // Fallback below
  }

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setStoredData<T>(key: string, value: T): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [key]: value });
      return;
    }
  } catch {
    // Fallback below
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage set failed:', err);
  }
}

export const StorageService = {
  async getAlarms(): Promise<AlarmItem[]> {
    const alarms = await getStoredData<AlarmItem[]>(STORAGE_KEYS.ALARMS, [
      {
        id: 'default-1',
        time: '08:30',
        label: 'Morning Standup & Review',
        enabled: true,
        repeat: 'weekdays',
        customDays: [1, 2, 3, 4, 5],
        sound: 'zen_bell',
        volume: 85,
        snoozeMinutes: 5,
        createdAt: Date.now(),
      },
      {
        id: 'default-2',
        time: '14:00',
        label: 'Hydration & Stretch',
        enabled: false,
        repeat: 'daily',
        customDays: [],
        sound: 'gentle_chime',
        volume: 80,
        snoozeMinutes: 5,
        createdAt: Date.now(),
      },
    ]);
    return alarms;
  },

  async saveAlarms(alarms: AlarmItem[]): Promise<void> {
    await setStoredData(STORAGE_KEYS.ALARMS, alarms);
  },

  async getTimer(): Promise<TimerState> {
    return await getStoredData<TimerState>(STORAGE_KEYS.TIMER, DEFAULT_TIMER);
  },

  async saveTimer(timer: TimerState): Promise<void> {
    await setStoredData(STORAGE_KEYS.TIMER, timer);
  },

  async getStopwatch(): Promise<StopwatchState> {
    return await getStoredData<StopwatchState>(STORAGE_KEYS.STOPWATCH, DEFAULT_STOPWATCH);
  },

  async saveStopwatch(stopwatch: StopwatchState): Promise<void> {
    await setStoredData(STORAGE_KEYS.STOPWATCH, stopwatch);
  },

  async getSettings(): Promise<AppSettings> {
    return await getStoredData<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await setStoredData(STORAGE_KEYS.SETTINGS, settings);
  },

  async getRingingEvent(): Promise<RingingEvent | null> {
    return await getStoredData<RingingEvent | null>(STORAGE_KEYS.RINGING, null);
  },

  async setRingingEvent(event: RingingEvent | null): Promise<void> {
    await setStoredData(STORAGE_KEYS.RINGING, event);
  },
};
