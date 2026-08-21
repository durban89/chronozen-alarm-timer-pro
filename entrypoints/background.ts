import type { AlarmItem, RingingEvent, TimerState } from '../src/types';
import { StorageService } from '../src/utils/storage';
import { calculateNextAlarmTime } from '../src/utils/time';
import { ensureOffscreenRingDocument, stopOffscreenRing } from '../src/utils/offscreen-ring';

export default defineBackground(() => {
  console.log('ChronoZen background service worker initialized');

  // Initialize alarms on extension install / startup
  browser.runtime.onInstalled.addListener(() => {
    syncAllAlarmsToChrome();
  });

  browser.runtime.onStartup.addListener(() => {
    syncAllAlarmsToChrome();
  });

  // Handle Chrome alarms trigger
  browser.alarms.onAlarm.addListener(async (alarm) => {
    console.log('Alarm triggered in background:', alarm.name);

    if (alarm.name.startsWith('chronozen-alarm-')) {
      const alarmId = alarm.name.replace('chronozen-alarm-', '');
      await handleAlarmTriggered(alarmId);
    } else if (alarm.name.startsWith('chronozen-snooze-')) {
      const alarmId = alarm.name.replace('chronozen-snooze-', '');
      await handleSnoozeTriggered(alarmId);
    } else if (alarm.name === 'chronozen-timer') {
      await handleTimerCompleted();
    }
  });

  // Handle desktop notification action clicks
  browser.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
    if (notificationId.startsWith('notif-alarm-')) {
      const alarmId = notificationId.replace('notif-alarm-', '');
      if (buttonIndex === 0) {
        // Snooze (default 5 min)
        await snoozeAlarm(alarmId, 5);
        browser.notifications.clear(notificationId);
      } else {
        // Dismiss
        await dismissActiveAlarm();
        browser.notifications.clear(notificationId);
      }
    } else if (notificationId.startsWith('notif-timer')) {
      await dismissActiveAlarm();
      browser.notifications.clear(notificationId);
    }
  });

  // Handle runtime messages from UI popup
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'SYNC_ALARMS') {
      syncAllAlarmsToChrome().then(() => sendResponse({ success: true }));
      return true; // Keep message channel open for async
    }

    if (message.type === 'SET_TIMER') {
      const seconds = message.seconds as number;
      setTimerAlarm(seconds).then(() => sendResponse({ success: true }));
      return true;
    }

    if (message.type === 'CANCEL_TIMER') {
      cancelTimerAlarm().then(() => sendResponse({ success: true }));
      return true;
    }

    if (message.type === 'DISMISS_RINGING') {
      dismissActiveAlarm().then(() => sendResponse({ success: true }));
      return true;
    }

    if (message.type === 'SNOOZE_ALARM') {
      snoozeAlarm(message.alarmId, message.minutes || 5).then(() => sendResponse({ success: true }));
      return true;
    }
  });
});

async function syncAllAlarmsToChrome() {
  // Clear existing chronozen alarms
  const allAlarms = await browser.alarms.getAll();
  for (const a of allAlarms) {
    if (a.name.startsWith('chronozen-alarm-')) {
      await browser.alarms.clear(a.name);
    }
  }

  const alarms = await StorageService.getAlarms();
  let nextUpcomingTimestamp: number | null = null;

  for (const item of alarms) {
    if (item.enabled) {
      const nextTime = calculateNextAlarmTime(item);
      if (nextTime) {
        browser.alarms.create(`chronozen-alarm-${item.id}`, {
          when: nextTime,
        });

        if (!nextUpcomingTimestamp || nextTime < nextUpcomingTimestamp) {
          nextUpcomingTimestamp = nextTime;
        }
      }
    }
  }

  // Update badge
  if (nextUpcomingTimestamp) {
    const activeCount = alarms.filter((a) => a.enabled).length;
    browser.action.setBadgeText({ text: activeCount > 0 ? `${activeCount}` : '' });
    browser.action.setBadgeBackgroundColor({ color: '#10b981' }); // emerald
  } else {
    browser.action.setBadgeText({ text: '' });
  }
}

async function handleAlarmTriggered(alarmId: string) {
  const alarms = await StorageService.getAlarms();
  const targetAlarm = alarms.find((a) => a.id === alarmId);
  if (!targetAlarm) return;

  const event: RingingEvent = {
    id: targetAlarm.id,
    type: 'alarm',
    title: targetAlarm.label || 'Alarm',
    sound: targetAlarm.sound,
    volume: targetAlarm.volume,
    timestamp: Date.now(),
    snoozeMinutes: targetAlarm.snoozeMinutes || 5,
  };

  await StorageService.setRingingEvent(event);

  // Make noise even when the popup is closed. When the popup is open it rings
  // on its own via the storage listener.
  const settings = await StorageService.getSettings();
  if (settings.soundEnabled && !isPopupOpen()) {
    await notifyInBackground(settings.openAlertPage);
  }

  // Update icon badge to alert state
  browser.action.setBadgeText({ text: '⏰' });
  browser.action.setBadgeBackgroundColor({ color: '#ef4444' }); // Red

  // Show desktop notification
  try {
    browser.notifications.create(`notif-alarm-${targetAlarm.id}`, {
      type: 'basic',
      iconUrl: '/icon/128.png',
      title: `⏰ Alarm: ${targetAlarm.label || 'Time Up!'}`,
      message: `Scheduled for ${targetAlarm.time}. Click to snooze or dismiss.`,
      priority: 2,
      requireInteraction: true,
      buttons: [{ title: '💤 Snooze (+5m)' }, { title: '✕ Dismiss' }],
    });
  } catch (err) {
    console.error('Notification creation failed:', err);
  }

  // Handle repetition / auto-disable if once
  if (targetAlarm.repeat === 'once') {
    const updatedAlarms = alarms.map((a) => (a.id === alarmId ? { ...a, enabled: false } : a));
    await StorageService.saveAlarms(updatedAlarms);
  } else {
    // Reschedule next
    const nextTime = calculateNextAlarmTime(targetAlarm);
    if (nextTime) {
      browser.alarms.create(`chronozen-alarm-${targetAlarm.id}`, {
        when: nextTime,
      });
    }
  }
}

async function handleSnoozeTriggered(alarmId: string) {
  await handleAlarmTriggered(alarmId);
}

async function handleTimerCompleted() {
  const timer = await StorageService.getTimer();
  const updatedTimer: TimerState = {
    ...timer,
    remainingSeconds: 0,
    isRunning: false,
    isPaused: false,
  };
  await StorageService.saveTimer(updatedTimer);

  const event: RingingEvent = {
    id: 'timer-finished',
    type: 'timer',
    title: timer.label || 'Focus Timer Finished',
    sound: timer.sound || 'gentle_chime',
    volume: 85,
    timestamp: Date.now(),
  };

  await StorageService.setRingingEvent(event);

  const settings = await StorageService.getSettings();
  if (settings.soundEnabled && !isPopupOpen()) {
    await notifyInBackground(settings.openAlertPage);
  }

  browser.action.setBadgeText({ text: 'DONE' });
  browser.action.setBadgeBackgroundColor({ color: '#3b82f6' }); // Blue

  try {
    browser.notifications.create(`notif-timer-${Date.now()}`, {
      type: 'basic',
      iconUrl: '/icon/128.png',
      title: `⏳ Timer Complete: ${timer.label || 'Focus Session'}`,
      message: 'Great job! Take a short break or start your next session.',
      priority: 2,
      requireInteraction: true,
      buttons: [{ title: '✕ Dismiss' }],
    });
  } catch (err) {
    console.error('Timer notification failed:', err);
  }
}

async function snoozeAlarm(alarmId: string, minutes: number = 5) {
  const snoozeUntil = Date.now() + minutes * 60 * 1000;
  browser.alarms.create(`chronozen-snooze-${alarmId}`, {
    when: snoozeUntil,
  });

  await StorageService.setRingingEvent(null);
  stopOffscreenRing();
  browser.action.setBadgeText({ text: `+${minutes}m` });
  browser.action.setBadgeBackgroundColor({ color: '#f59e0b' }); // Amber
}

async function dismissActiveAlarm() {
  await StorageService.setRingingEvent(null);
  stopOffscreenRing();
  await syncAllAlarmsToChrome();
}

function isPopupOpen(): boolean {
  try {
    return browser.extension.getViews({ type: 'popup' }).length > 0;
  } catch {
    return false;
  }
}

/**
 * Make the alarm audible without the popup: open a small alert window
 * (plays sound and shows dismiss/snooze), or fall back to the offscreen
 * audio player when the alert page is disabled.
 */
async function notifyInBackground(openAlertPage: boolean): Promise<void> {
  if (openAlertPage) {
    await openAlertWindow();
  } else {
    await ensureOffscreenRingDocument();
  }
}

async function openAlertWindow(): Promise<void> {
  const url = browser.runtime.getURL('/alert.html');
  try {
    const existing = await browser.tabs.query({ url });
    if (existing.length > 0) return; // already ringing in a window
  } catch {
    // URL query filtering unavailable; just create the window.
  }
  try {
    await browser.windows.create({
      url,
      type: 'popup',
      width: 420,
      height: 480,
      focused: true,
    });
  } catch {
    await browser.tabs.create({ url });
  }
}

async function setTimerAlarm(seconds: number) {
  const when = Date.now() + seconds * 1000;
  browser.alarms.create('chronozen-timer', {
    when,
  });
}

async function cancelTimerAlarm() {
  browser.alarms.clear('chronozen-timer');
}
