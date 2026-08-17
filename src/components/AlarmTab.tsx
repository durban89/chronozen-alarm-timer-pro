import React, { useState } from 'react';
import { AlarmClock, Bell, Clock, Edit2, Plus, Trash2 } from 'lucide-react';
import type { AlarmItem, AppSettings } from '../types';
import { calculateNextAlarmTime, formatRepeatSummary, formatTimeRemaining, formatTimeString } from '../utils/time';
import { AlarmModal } from './AlarmModal';

interface AlarmTabProps {
  alarms: AlarmItem[];
  settings: AppSettings;
  onToggleAlarm: (id: string) => void;
  onSaveAlarm: (alarm: AlarmItem) => void;
  onDeleteAlarm: (id: string) => void;
}

export const AlarmTab: React.FC<AlarmTabProps> = ({
  alarms,
  settings,
  onToggleAlarm,
  onSaveAlarm,
  onDeleteAlarm,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingAlarm, setEditingAlarm] = useState<AlarmItem | null>(null);

  // Find next upcoming active alarm
  let nextAlarm: { alarm: AlarmItem; timestamp: number } | null = null;
  alarms.forEach((a) => {
    if (a.enabled) {
      const nextTime = calculateNextAlarmTime(a);
      if (nextTime) {
        if (!nextAlarm || nextTime < nextAlarm.timestamp) {
          nextAlarm = { alarm: a, timestamp: nextTime };
        }
      }
    }
  });

  const handleOpenNewModal = () => {
    setEditingAlarm(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (alarm: AlarmItem) => {
    setEditingAlarm(alarm);
    setModalOpen(true);
  };

  const handleSaveModal = (alarm: AlarmItem) => {
    onSaveAlarm(alarm);
    setModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3">
      {/* Upcoming Alarm Banner */}
      {nextAlarm ? (
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-xl p-3 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-400">
                Next Alarm: {formatTimeString(nextAlarm.alarm.time, settings.timeFormat24h)}
              </div>
              <div className="text-[10px] text-slate-400">
                {nextAlarm.alarm.label || 'Alarm'} • {formatTimeRemaining(nextAlarm.timestamp)}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Active
          </span>
        </div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-2.5 flex items-center justify-between text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <AlarmClock className="w-4 h-4 text-slate-500" />
            <span>No active alarms scheduled</span>
          </div>
          <button
            onClick={handleOpenNewModal}
            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
          >
            + Set one
          </button>
        </div>
      )}

      {/* Alarms List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
        {alarms.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-2.5 shadow-inner">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">No alarms created yet</h3>
            <p className="text-xs text-slate-500 max-w-[220px] mt-1 mb-3">
              Set alarms for morning wake-up, standups, or work reminders.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-emerald-500/20"
            >
              Add First Alarm
            </button>
          </div>
        ) : (
          alarms.map((item) => {
            const nextTime = calculateNextAlarmTime(item);
            return (
              <div
                key={item.id}
                className={`group relative rounded-xl border p-3 transition-all duration-200 ${
                  item.enabled
                    ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 cursor-pointer" onClick={() => handleOpenEditModal(item)}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono tracking-tight text-white">
                        {formatTimeString(item.time, settings.timeFormat24h)}
                      </span>
                      <span className="text-[11px] font-medium text-slate-300 truncate max-w-[130px]">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-medium text-slate-400">
                        {formatRepeatSummary(item.repeat, item.customDays)}
                      </span>
                      {item.enabled && nextTime && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400/90 font-medium">
                            {formatTimeRemaining(nextTime)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => onToggleAlarm(item.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          item.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Card Quick Actions (Edit / Delete) */}
                <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-slate-700/40 text-[10px]">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteAlarm(item.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Alarm Button */}
      <button
        onClick={handleOpenNewModal}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        Add New Alarm
      </button>

      {/* Alarm Modal */}
      {modalOpen && (
        <AlarmModal
          alarm={editingAlarm}
          onSave={handleSaveModal}
          onClose={() => setModalOpen(false)}
          is24h={settings.timeFormat24h}
        />
      )}
    </div>
  );
};
