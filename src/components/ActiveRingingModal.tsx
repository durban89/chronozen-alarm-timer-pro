import React, { useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import type { RingingEvent } from '../types';
import { audioSynth } from '../utils/audio';

interface ActiveRingingModalProps {
  ringingEvent: RingingEvent;
  onDismiss: () => void;
  onSnooze: (alarmId: string, minutes: number) => void;
  soundEnabled: boolean;
}

export const ActiveRingingModal: React.FC<ActiveRingingModalProps> = ({
  ringingEvent,
  onDismiss,
  onSnooze,
  soundEnabled,
}) => {
  useEffect(() => {
    if (soundEnabled) {
      audioSynth.startRinging(ringingEvent.sound, ringingEvent.volume);
    }
    return () => {
      audioSynth.stopRinging();
    };
  }, [ringingEvent, soundEnabled]);

  const handleDismiss = () => {
    audioSynth.stopRinging();
    onDismiss();
  };

  const handleSnooze = () => {
    audioSynth.stopRinging();
    onSnooze(ringingEvent.id, ringingEvent.snoozeMinutes || 5);
  };

  const isTimer = ringingEvent.type === 'timer';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      {/* Animated Glowing Ringing Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center animate-ping absolute inset-0" />
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-rose-500/40 relative z-10 animate-bounce">
          <Bell className="w-12 h-12 text-white stroke-[2.5] animate-ring-bell" />
        </div>
      </div>

      {/* Alarm Title & Subtitle */}
      <div className="space-y-1.5 mb-8">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
          {isTimer ? 'Focus Timer Finished' : 'Alarm Ringing'}
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white mt-1">
          {ringingEvent.title || (isTimer ? 'Timer Finished' : 'Time is Up!')}
        </h2>
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-1">
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xs space-y-2.5">
        <button
          onClick={handleDismiss}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          Dismiss Alarm
        </button>

        {!isTimer && (
          <button
            onClick={handleSnooze}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            💤 Snooze (+{ringingEvent.snoozeMinutes || 5} min)
          </button>
        )}
      </div>
    </div>
  );
};
