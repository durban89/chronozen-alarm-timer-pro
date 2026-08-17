import React, { useEffect, useState } from 'react';
import { type ActiveTab, TabNavigation } from '../../src/components/TabNavigation';
import { Header } from '../../src/components/Header';
import { AlarmTab } from '../../src/components/AlarmTab';
import { TimerTab } from '../../src/components/TimerTab';
import { StopwatchTab } from '../../src/components/StopwatchTab';
import { SettingsTab } from '../../src/components/SettingsTab';
import { ActiveRingingModal } from '../../src/components/ActiveRingingModal';
import type { AlarmItem, AppSettings, RingingEvent, SoundType, StopwatchState, TimerState } from '../../src/types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STOPWATCH,
  DEFAULT_TIMER,
  StorageService,
} from '../../src/utils/storage';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('alarms');
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [timer, setTimer] = useState<TimerState>(DEFAULT_TIMER);
  const [stopwatch, setStopwatch] = useState<StopwatchState>(DEFAULT_STOPWATCH);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ringingEvent, setRingingEvent] = useState<RingingEvent | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initial data fetch
  useEffect(() => {
    async function initData() {
      const [savedAlarms, savedTimer, savedStopwatch, savedSettings, savedRinging] = await Promise.all([
        StorageService.getAlarms(),
        StorageService.getTimer(),
        StorageService.getStopwatch(),
        StorageService.getSettings(),
        StorageService.getRingingEvent(),
      ]);

      setAlarms(savedAlarms);
      setSettings(savedSettings);
      setStopwatch(savedStopwatch);
      setRingingEvent(savedRinging);

      // Restore active timer state
      if (savedTimer.isRunning && savedTimer.targetTimestamp) {
        const remaining = Math.max(0, Math.ceil((savedTimer.targetTimestamp - Date.now()) / 1000));
        if (remaining <= 0) {
          setTimer({ ...savedTimer, remainingSeconds: 0, isRunning: false, isPaused: false });
        } else {
          setTimer({ ...savedTimer, remainingSeconds: remaining });
        }
      } else {
        setTimer(savedTimer);
      }

      setIsLoaded(true);
    }

    initData();
  }, []);

  // Listen to chrome storage updates from background worker
  useEffect(() => {
    const handleStorageChange = (changes: Record<string, { newValue?: unknown }>, area: string) => {
      if (area === 'local') {
        if (changes.chronozen_ringing) {
          setRingingEvent((changes.chronozen_ringing.newValue as RingingEvent) || null);
        }
        if (changes.chronozen_alarms) {
          setAlarms((changes.chronozen_alarms.newValue as AlarmItem[]) || []);
        }
        if (changes.chronozen_timer) {
          const newTimer = changes.chronozen_timer.newValue as TimerState;
          if (newTimer) setTimer(newTimer);
        }
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, []);

  // Timer interval ticker
  useEffect(() => {
    let intervalId: number;

    if (timer.isRunning && timer.targetTimestamp) {
      intervalId = window.setInterval(() => {
        const remaining = Math.max(0, Math.ceil((timer.targetTimestamp! - Date.now()) / 1000));
        if (remaining <= 0) {
          // Timer completed
          const finishedTimer: TimerState = {
            ...timer,
            remainingSeconds: 0,
            isRunning: false,
            isPaused: false,
          };
          setTimer(finishedTimer);
          StorageService.saveTimer(finishedTimer);

          const ringEvt: RingingEvent = {
            id: 'timer-finish',
            type: 'timer',
            title: timer.label || 'Focus Timer Complete',
            sound: timer.sound || settings.defaultSound,
            volume: settings.masterVolume,
            timestamp: Date.now(),
          };
          setRingingEvent(ringEvt);
          StorageService.setRingingEvent(ringEvt);
        } else {
          setTimer((prev) => ({ ...prev, remainingSeconds: remaining }));
        }
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timer.isRunning, timer.targetTimestamp, timer.label, timer.sound, settings.defaultSound, settings.masterVolume]);

  // Alarms Handlers
  const handleToggleAlarm = async (id: string) => {
    const updated = alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    setAlarms(updated);
    await StorageService.saveAlarms(updated);
    sendBackgroundMessage({ type: 'SYNC_ALARMS' });
  };

  const handleSaveAlarm = async (alarm: AlarmItem) => {
    const exists = alarms.some((a) => a.id === alarm.id);
    let updated: AlarmItem[];
    if (exists) {
      updated = alarms.map((a) => (a.id === alarm.id ? alarm : a));
    } else {
      updated = [alarm, ...alarms];
    }
    setAlarms(updated);
    await StorageService.saveAlarms(updated);
    sendBackgroundMessage({ type: 'SYNC_ALARMS' });
  };

  const handleDeleteAlarm = async (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    setAlarms(updated);
    await StorageService.saveAlarms(updated);
    sendBackgroundMessage({ type: 'SYNC_ALARMS' });
  };

  // Timer Handlers
  const handleStartTimer = async (totalSeconds: number, label: string, sound: SoundType) => {
    const targetTimestamp = Date.now() + totalSeconds * 1000;
    const newTimer: TimerState = {
      totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: true,
      isPaused: false,
      label,
      sound,
      targetTimestamp,
    };
    setTimer(newTimer);
    await StorageService.saveTimer(newTimer);
    sendBackgroundMessage({ type: 'SET_TIMER', seconds: totalSeconds });
  };

  const handlePauseTimer = async () => {
    const newTimer: TimerState = {
      ...timer,
      isRunning: false,
      isPaused: true,
      targetTimestamp: undefined,
    };
    setTimer(newTimer);
    await StorageService.saveTimer(newTimer);
    sendBackgroundMessage({ type: 'CANCEL_TIMER' });
  };

  const handleResumeTimer = async () => {
    const targetTimestamp = Date.now() + timer.remainingSeconds * 1000;
    const newTimer: TimerState = {
      ...timer,
      isRunning: true,
      isPaused: false,
      targetTimestamp,
    };
    setTimer(newTimer);
    await StorageService.saveTimer(newTimer);
    sendBackgroundMessage({ type: 'SET_TIMER', seconds: timer.remainingSeconds });
  };

  const handleResetTimer = async () => {
    const newTimer: TimerState = {
      ...timer,
      remainingSeconds: timer.totalSeconds,
      isRunning: false,
      isPaused: false,
      targetTimestamp: undefined,
    };
    setTimer(newTimer);
    await StorageService.saveTimer(newTimer);
    sendBackgroundMessage({ type: 'CANCEL_TIMER' });
  };

  const handleAddExtraSeconds = async (extraSeconds: number) => {
    const newRemaining = timer.remainingSeconds + extraSeconds;
    const newTotal = timer.totalSeconds + extraSeconds;
    const targetTimestamp = Date.now() + newRemaining * 1000;

    const newTimer: TimerState = {
      ...timer,
      totalSeconds: newTotal,
      remainingSeconds: newRemaining,
      targetTimestamp: timer.isRunning ? targetTimestamp : undefined,
    };
    setTimer(newTimer);
    await StorageService.saveTimer(newTimer);
    if (timer.isRunning) {
      sendBackgroundMessage({ type: 'SET_TIMER', seconds: newRemaining });
    }
  };

  // Stopwatch Handlers
  const handleUpdateStopwatch = async (newState: StopwatchState) => {
    setStopwatch(newState);
    await StorageService.saveStopwatch(newState);
  };

  // Settings Handlers
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
  };

  const handleToggleSound = async () => {
    const newSettings = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
  };

  const handleResetAllData = async () => {
    if (confirm('Are you sure you want to reset all alarms and timers to default?')) {
      const defaultAlarms = await StorageService.getAlarms();
      setAlarms(defaultAlarms);
      setTimer(DEFAULT_TIMER);
      setStopwatch(DEFAULT_STOPWATCH);
      setSettings(DEFAULT_SETTINGS);
      setRingingEvent(null);
      await Promise.all([
        StorageService.saveAlarms(defaultAlarms),
        StorageService.saveTimer(DEFAULT_TIMER),
        StorageService.saveStopwatch(DEFAULT_STOPWATCH),
        StorageService.saveSettings(DEFAULT_SETTINGS),
        StorageService.setRingingEvent(null),
      ]);
      sendBackgroundMessage({ type: 'SYNC_ALARMS' });
    }
  };

  // Dismiss / Snooze Ringing Handlers
  const handleDismissRinging = async () => {
    setRingingEvent(null);
    await StorageService.setRingingEvent(null);
    sendBackgroundMessage({ type: 'DISMISS_RINGING' });
  };

  const handleSnoozeRinging = async (alarmId: string, minutes: number) => {
    setRingingEvent(null);
    await StorageService.setRingingEvent(null);
    sendBackgroundMessage({ type: 'SNOOZE_ALARM', alarmId, minutes });
  };

  function sendBackgroundMessage(msg: Record<string, unknown>) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(msg);
      }
    } catch {
      // Ignore when running outside extension runtime
    }
  }

  if (!isLoaded) {
    return (
      <div className="w-[380px] h-[580px] bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading ChronoZen...</span>
        </div>
      </div>
    );
  }

  const activeAlarmsCount = alarms.filter((a) => a.enabled).length;

  return (
    <div className="w-[380px] h-[580px] bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative select-none">
      {/* Header with Live Clock and Global Sound Toggle */}
      <Header
        settings={settings}
        activeAlarmsCount={activeAlarmsCount}
        isTimerRunning={timer.isRunning}
        onToggleSound={handleToggleSound}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        activeAlarmsCount={activeAlarmsCount}
        isTimerRunning={timer.isRunning}
        isStopwatchRunning={stopwatch.isRunning}
      />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {activeTab === 'alarms' && (
          <AlarmTab
            alarms={alarms}
            settings={settings}
            onToggleAlarm={handleToggleAlarm}
            onSaveAlarm={handleSaveAlarm}
            onDeleteAlarm={handleDeleteAlarm}
          />
        )}

        {activeTab === 'timer' && (
          <TimerTab
            timer={timer}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onResumeTimer={handleResumeTimer}
            onResetTimer={handleResetTimer}
            onAddExtraSeconds={handleAddExtraSeconds}
          />
        )}

        {activeTab === 'stopwatch' && (
          <StopwatchTab stopwatch={stopwatch} onUpdateStopwatch={handleUpdateStopwatch} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Active Ringing Overlay Modal */}
      {ringingEvent && (
        <ActiveRingingModal
          ringingEvent={ringingEvent}
          onDismiss={handleDismissRinging}
          onSnooze={handleSnoozeRinging}
          soundEnabled={settings.soundEnabled}
        />
      )}
    </div>
  );
}

export default App;
