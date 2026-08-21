export const RING_STOP = 'CHRONOZEN_RING_STOP';

const OFFSCREEN_URL = '/offscreen.html';

function offscreenAvailable(): boolean {
  return typeof browser !== 'undefined' && !!browser.offscreen;
}

/**
 * Make sure the offscreen audio player document exists. The player is
 * storage-driven: it watches `chronozen_ringing` and plays/stops on its own,
 * so no "start" message is needed (avoids createDocument message races).
 */
export async function ensureOffscreenRingDocument(): Promise<void> {
  if (!offscreenAvailable()) return;
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
