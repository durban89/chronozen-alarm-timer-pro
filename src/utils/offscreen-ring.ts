import type { SoundType } from '../types';

export const RING_START = 'CHRONOZEN_RING_START';
export const RING_STOP = 'CHRONOZEN_RING_STOP';

const OFFSCREEN_URL = '/offscreen.html';

function offscreenAvailable(): boolean {
  return typeof browser !== 'undefined' && !!browser.offscreen;
}

async function ensureOffscreenDocument(): Promise<void> {
  try {
    const contexts = await browser.runtime.getContexts({
      contextTypes: [browser.runtime.ContextType.OFFSCREEN_DOCUMENT],
    });
    if (contexts && contexts.length > 0) {
      return;
    }
  } catch {
    // getContexts unavailable (Chrome < 116); fall through and attempt creation.
  }

  await browser.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: [browser.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Plays ChronoZen alarm and timer ringing sounds while the popup is closed.',
  });
}

/**
 * Start the looping ring sound in the offscreen document.
 * Safe to call when the API is unavailable (Firefox / non-extension env): it no-ops.
 */
export async function startOffscreenRing(sound: SoundType, volume: number): Promise<void> {
  if (!offscreenAvailable()) return;
  try {
    await ensureOffscreenDocument();
    await browser.runtime.sendMessage({ type: RING_START, sound, volume });
  } catch (err) {
    console.error('ChronoZen offscreen ring failed:', err);
  }
}

/**
 * Fire-and-forget stop signal. No-ops silently when no offscreen document exists.
 */
export function stopOffscreenRing(): void {
  if (!offscreenAvailable()) return;
  try {
    const result = browser.runtime.sendMessage({ type: RING_STOP }) as unknown;
    if (result instanceof Promise) {
      result.catch(() => {
        // Receiving end does not exist — nothing to stop.
      });
    }
  } catch {
    // Ignore
  }
}
