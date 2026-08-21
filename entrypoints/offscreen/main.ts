import { audioSynth } from '../../src/utils/audio';
import { RING_START, RING_STOP } from '../../src/utils/offscreen-ring';
import type { SoundType } from '../../src/types';

export default defineUnlistedScript(() => {
  console.log('ChronoZen offscreen audio player ready');

  browser.runtime.onMessage.addListener((message: unknown) => {
    const msg = message as { type?: string; sound?: SoundType; volume?: number };
    if (msg?.type === RING_START) {
      audioSynth.startRinging(msg.sound ?? 'zen_bell', msg.volume ?? 80);
    } else if (msg?.type === RING_STOP) {
      audioSynth.stopRinging();
    }
  });
});
