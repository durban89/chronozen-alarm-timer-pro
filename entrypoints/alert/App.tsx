import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Check, Clock, VolumeX } from 'lucide-react';
import type { AppSettings, RingingEvent } from '../../src/types';
import { DEFAULT_SETTINGS, StorageService } from '../../src/utils/storage';
import { audioSynth } from '../../src/utils/audio';

function sendBackgroundMessage(msg: Record<string, unknown>): void {
  try {
    const result = browser.runtime.sendMessage(msg) as unknown;
    if (result instanceof Promise) result.catch(() => {});
  } catch {
    // Ignore when running outside extension runtime
  }
}

export default function App() {
  const [ringingEvent, setRingingEvent] = useState<RingingEvent | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      const [event, savedSettings] = await Promise.all([
        StorageService.getRingingEvent(),
        StorageService.getSettings(),
      ]);
      setRingingEvent(event);
      setSettings(savedSettings);
      setIsLoaded(true);

      if (!event) {
        window.close();
      }
    }
    void init();
  }, []);

  // Ring while an event is active
  useEffect(() => {
    if (!ringingEvent || !settings.soundEnabled) return;

    audioSynth.startRinging(ringingEvent.sound, ringingEvent.volume);

    // Autoplay policy fallback: if the context is still suspended, ask for a click.
    const timer = window.setTimeout(() => {
      if (audioSynth.isContextSuspended()) {
        setNeedsGesture(true);
      }
    }, 600);

    return () => {
      window.clearTimeout(timer);
      audioSynth.stopRinging();
    };
  }, [ringingEvent, settings.soundEnabled]);

  // React to storage updates (dismiss/snooze from notification or popup)
  useEffect(() => {
    if (!browser.storage?.onChanged) return;
    const listener = (changes: Record<string, { newValue?: unknown }>, area: string) => {
      if (area !== 'local') return;
      if (changes.chronozen_ringing) {
        const next = (changes.chronozen_ringing.newValue as RingingEvent) || null;
        setRingingEvent(next);
        if (!next) window.close();
      }
      if (changes.chronozen_settings) {
        setSettings((changes.chronozen_settings.newValue as AppSettings) || DEFAULT_SETTINGS);
      }
    };
    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }, []);

  const enableSound = useCallback(() => {
    audioSynth.resumeContext();
    setNeedsGesture(false);
  }, []);

  const handleDismiss = () => {
    sendBackgroundMessage({ type: 'DISMISS_RINGING' });
    window.close();
  };

  const handleSnooze = () => {
    if (!ringingEvent) return;
    sendBackgroundMessage({
      type: 'SNOOZE_ALARM',
      alarmId: ringingEvent.id,
      minutes: ringingEvent.snoozeMinutes || 5,
    });
    window.close();
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  const isTimer = ringingEvent?.type === 'timer';

  return (
    <div
      className="w-full h-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none"
      onPointerDown={enableSound}
    >
      {ringingEvent ? (
        <>
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-rose-500/20 border-2 border-rose-500/40 animate-ping absolute inset-0" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-rose-500/40 relative z-10 animate-bounce">
              <Bell className="w-12 h-12 text-white stroke-[2.5] animate-ring-bell" />
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
            {isTimer ? 'Focus Timer Finished' : 'Alarm Ringing'}
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            {ringingEvent.title || (isTimer ? 'Timer Finished' : 'Time is Up!')}
          </h1>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1 pt-2">
            <Clock className="w-3.5 h-3.5" />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>

          {needsGesture && (
            <p className="mt-4 text-[11px] text-amber-400 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5">
              <VolumeX className="w-3.5 h-3.5" />
              Click anywhere to enable sound
            </p>
          )}

          <div className="w-full max-w-xs space-y-2.5 mt-8">
            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              Dismiss
            </button>
            {!isTimer && (
              <button
                onClick={handleSnooze}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition active:scale-95"
              >
                💤 Snooze (+{ringingEvent.snoozeMinutes || 5} min)
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="text-slate-500 text-sm">No active alarm.</p>
      )}
    </div>
  );
}
