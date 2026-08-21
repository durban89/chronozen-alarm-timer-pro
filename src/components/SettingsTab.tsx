import React, { useState } from 'react';
import { Bell, Check, Clock, Play, RotateCcw, ShieldCheck, Volume2 } from 'lucide-react';
import type { AppSettings, SoundType } from '../types';
import { audioSynth } from '../utils/audio';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetAllData: () => void;
}

const SOUND_OPTIONS: { id: SoundType; label: string }[] = [
  { id: 'zen_bell', label: 'Zen Tibetan Bell' },
  { id: 'gentle_chime', label: 'Gentle Chime' },
  { id: 'digital_beep', label: 'Classic Digital' },
  { id: 'radar', label: 'Radar Alert' },
  { id: 'marimba', label: 'Marimba Melody' },
];

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);

  const handleTestSound = () => {
    setIsPlayingTest(true);
    audioSynth.playSingleTone(settings.defaultSound, settings.masterVolume);
    setTimeout(() => setIsPlayingTest(false), 1200);
  };

  const handleTestNotification = async () => {
    if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create(`test-notif-${Date.now()}`, {
        type: 'basic',
        iconUrl: '/icon/128.png',
        title: '⏰ ChronoZen Test Notification',
        message: 'Your alarms & sound notifications are configured and working properly!',
        priority: 2,
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } else {
      alert('Desktop notifications are available when loaded as a browser extension.');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-4 overflow-y-auto text-xs">
      {/* Time & Display Preferences */}
      <div className="space-y-2">
        <h3 className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-emerald-400" /> Time Display
        </h3>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-slate-200 font-medium">24-Hour Time Format</div>
            <div className="text-[10px] text-slate-500">Display 14:00 instead of 02:00 PM</div>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, timeFormat24h: !settings.timeFormat24h })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              settings.timeFormat24h ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                settings.timeFormat24h ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Audio & Ringtones */}
      <div className="space-y-2">
        <h3 className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Sound & Ringtones
        </h3>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-3">
          {/* Default Ringtone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-medium">Default Alarm Sound</span>
              <button
                type="button"
                onClick={handleTestSound}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                {isPlayingTest ? 'Playing...' : 'Test Sound'}
              </button>
            </div>
            <select
              value={settings.defaultSound}
              onChange={(e) => onUpdateSettings({ ...settings, defaultSound: e.target.value as SoundType })}
              className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:border-emerald-500 outline-none"
            >
              {SOUND_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Master Volume */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span>Master Volume</span>
              <span className="font-mono text-emerald-400">{settings.masterVolume}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.masterVolume}
              onChange={(e) => onUpdateSettings({ ...settings, masterVolume: Number(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Alert Page (background ringing) */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <div>
              <div className="text-slate-200 font-medium">Open Alert Window</div>
              <div className="text-[10px] text-slate-500 pr-2">
                When an alarm fires while the popup is closed, open a small window that plays the sound
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, openAlertPage: !settings.openAlertPage })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                settings.openAlertPage ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                  settings.openAlertPage ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Test */}
      <div className="space-y-2">
        <h3 className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
          <Bell className="w-3.5 h-3.5 text-emerald-400" /> Notifications Check
        </h3>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-slate-200 font-medium">Desktop Alerts</div>
            <div className="text-[10px] text-slate-500">Test banner notification display</div>
          </div>
          <button
            onClick={handleTestNotification}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-[11px] font-medium transition flex items-center gap-1"
          >
            {testNotificationSent ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" /> Sent!
              </>
            ) : (
              'Send Test'
            )}
          </button>
        </div>
      </div>

      {/* Store Compliance & Privacy Pledge Card */}
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
          <ShieldCheck className="w-4 h-4" />
          <span>Store Compliant & 100% Private</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          ChronoZen operates strictly offline using browser storage. No user data, analytics, or browsing history is tracked or collected.
        </p>
      </div>

      {/* Reset Data */}
      <div className="pt-1">
        <button
          onClick={onResetAllData}
          className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 transition text-[11px] font-medium flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Alarms to Default
        </button>
      </div>
    </div>
  );
};
