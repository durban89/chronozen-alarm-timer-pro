import { audioSynth } from '../../src/utils/audio';
import { StorageService } from '../../src/utils/storage';
import { RING_STOP } from '../../src/utils/offscreen-ring';
import type { SoundType } from '../../src/types';

console.log('ChronoZen offscreen audio player ready');

// Storage-driven playback: reacts to ringing events just like the popup does.
// This avoids races where messages are sent before this document finished loading.
async function syncWithStorage(): Promise<void> {
  const [event, settings] = await Promise.all([
    StorageService.getRingingEvent(),
    StorageService.getSettings(),
  ]);
  if (event && settings.soundEnabled) {
    audioSynth.startRinging(event.sound, event.volume);
  } else {
    audioSynth.stopRinging();
  }
}

void syncWithStorage();

if (browser.storage.onChanged) {
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.chronozen_ringing) {
      void syncWithStorage();
    }
  });
}

browser.runtime.onMessage.addListener((message: unknown) => {
  const msg = message as { type?: string; sound?: SoundType; volume?: number };
  if (msg?.type === RING_STOP) {
    audioSynth.stopRinging();
  }
});
