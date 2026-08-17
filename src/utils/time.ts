import type { AlarmItem, RepeatMode } from '../types';

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format a 24-hour time string "HH:mm" to 12-hour or 24-hour representation
 */
export function formatTimeString(timeStr: string, is24h: boolean = true): string {
  if (!timeStr) return '--:--';
  if (is24h) return timeStr;

  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculates the next trigger timestamp (in ms) for an alarm
 */
export function calculateNextAlarmTime(alarm: AlarmItem): number | null {
  if (!alarm.enabled) return null;

  const [hours, minutes] = alarm.time.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (alarm.repeat === 'once') {
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }

  if (alarm.repeat === 'daily') {
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }

  if (alarm.repeat === 'weekdays') {
    // 1 (Mon) to 5 (Fri)
    const validDays = [1, 2, 3, 4, 5];
    return getNextMatchingDayTimestamp(target, validDays, now);
  }

  if (alarm.repeat === 'weekends') {
    // 0 (Sun) and 6 (Sat)
    const validDays = [0, 6];
    return getNextMatchingDayTimestamp(target, validDays, now);
  }

  if (alarm.repeat === 'custom') {
    if (!alarm.customDays || alarm.customDays.length === 0) {
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      return target.getTime();
    }
    return getNextMatchingDayTimestamp(target, alarm.customDays, now);
  }

  return target.getTime();
}

function getNextMatchingDayTimestamp(baseTarget: Date, targetDays: number[], now: Date): number {
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(baseTarget);
    candidate.setDate(candidate.getDate() + offset);
    const dayOfWeek = candidate.getDay();

    if (targetDays.includes(dayOfWeek)) {
      if (candidate.getTime() > now.getTime()) {
        return candidate.getTime();
      }
    }
  }
  // Fallback next week
  const fallback = new Date(baseTarget);
  fallback.setDate(fallback.getDate() + 7);
  return fallback.getTime();
}

/**
 * Format relative countdown string like "in 4h 23m" or "in 12m"
 */
export function formatTimeRemaining(targetTimestamp: number | null): string {
  if (!targetTimestamp) return '';
  const diffMs = targetTimestamp - Date.now();
  if (diffMs <= 0) return 'Ringing now...';

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `in ${days}d ${remHours}h`;
  }
  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `in ${minutes}m`;
  }
  return 'in < 1m';
}

/**
 * Format repeat summary (e.g. "Weekdays", "Daily", "Mon, Wed, Fri")
 */
export function formatRepeatSummary(repeat: RepeatMode, customDays: number[] = []): string {
  switch (repeat) {
    case 'once':
      return 'Ring once';
    case 'daily':
      return 'Every day';
    case 'weekdays':
      return 'Mon – Fri';
    case 'weekends':
      return 'Weekends';
    case 'custom':
      if (!customDays || customDays.length === 0) return 'Once';
      if (customDays.length === 7) return 'Every day';
      return customDays.map((d) => DAY_NAMES_SHORT[d]).join(', ');
    default:
      return 'Once';
  }
}

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format milliseconds into 00:00:00.00 for stopwatch
 */
export function formatStopwatchMs(ms: number): { main: string; msFormatted: string } {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);

  const main = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const msFormatted = hundredths.toString().padStart(2, '0');

  return { main, msFormatted };
}
