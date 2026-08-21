import type { SoundType } from '../types';

class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private loopIntervalId: number | null = null;
  private isRinging: boolean = false;

  private getContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playSingleTone(sound: SoundType, volume: number = 80): void {
    const ctx = this.getContext();
    const masterVol = Math.max(0, Math.min(1, volume / 100)) * 0.4;
    const now = ctx.currentTime;

    switch (sound) {
      case 'zen_bell': {
        // Tibetan / Zen bowl harmonics (Warm fundamental + overtone)
        const fundamentalFreqs = [440, 880, 1320, 1760];
        const weights = [1, 0.4, 0.2, 0.1];
        
        fundamentalFreqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq + (i === 1 ? 1.5 : 0), now);

          noteGain.gain.setValueAtTime(masterVol * weights[i], now);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

          osc.connect(noteGain);
          noteGain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 2.5);
        });
        break;
      }

      case 'gentle_chime': {
        // Ascending melody: C5, E5, G5, C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          const startTime = now + idx * 0.18;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          noteGain.gain.setValueAtTime(masterVol * 0.8, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

          osc.connect(noteGain);
          noteGain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.85);
        });
        break;
      }

      case 'digital_beep': {
        // Classic digital alarm double beep
        const beeps = [0, 0.15, 0.35, 0.5];
        beeps.forEach((offset) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          const startTime = now + offset;

          osc.type = 'square';
          osc.frequency.setValueAtTime(1046.5, startTime); // C6 high beep

          noteGain.gain.setValueAtTime(masterVol * 0.5, startTime);
          noteGain.gain.setValueAtTime(0, startTime + 0.08);

          osc.connect(noteGain);
          noteGain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.09);
        });
        break;
      }

      case 'radar': {
        // Radar pulse ascending sweep
        const pulses = [0, 0.4];
        pulses.forEach((offset) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          const startTime = now + offset;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600, startTime);
          osc.frequency.exponentialRampToValueAtTime(1400, startTime + 0.25);

          noteGain.gain.setValueAtTime(masterVol * 0.9, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);

          osc.connect(noteGain);
          noteGain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.32);
        });
        break;
      }

      case 'marimba': {
        // Melodic percussion
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          const startTime = now + idx * 0.12;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          noteGain.gain.setValueAtTime(masterVol, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

          osc.connect(noteGain);
          noteGain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.45);
        });
        break;
      }
    }
  }

  public startRinging(sound: SoundType, volume: number = 80): void {
    if (this.isRinging) {
      this.stopRinging();
    }
    this.isRinging = true;

    // Play immediately
    this.playSingleTone(sound, volume);

    // Loop interval based on sound duration
    const intervalMs = sound === 'zen_bell' ? 3000 : 1800;
    this.loopIntervalId = window.setInterval(() => {
      if (this.isRinging) {
        this.playSingleTone(sound, volume);
      }
    }, intervalMs);
  }

  public stopRinging(): void {
    this.isRinging = false;
    if (this.loopIntervalId !== null) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
  }

  public isCurrentlyRinging(): boolean {
    return this.isRinging;
  }

  public isContextSuspended(): boolean {
    return !!this.audioCtx && this.audioCtx.state === 'suspended';
  }

  public resumeContext(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {
        // Resume rejected; keep waiting for a user gesture.
      });
    }
  }
}

export const audioSynth = new SoundSynthesizer();
