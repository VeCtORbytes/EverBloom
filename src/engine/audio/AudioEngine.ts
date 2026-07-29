import { Howl, Howler } from 'howler';
import { CueId } from '@/types/ids';
import { BusVolumeMap, DEFAULT_BUS_VOLUMES, calculateEffectiveVolume, AudioBusName } from './buses';
import { getSoundCue } from './cues';

export class AudioEngine {
  private volumes: BusVolumeMap = { ...DEFAULT_BUS_VOLUMES };
  private isUnlocked: boolean = false;
  private isDucked: boolean = false;
  private activeHowls: Map<CueId, Howl> = new Map();
  private unlockListenersAttached: boolean = false;

  constructor() {
    this.loadVolumesFromStorage();
  }

  /**
   * Unlock WebAudio/Howler playback on the user's first gesture without popup.
   */
  public attachUnlockListener(container: HTMLElement | Window = window): void {
    if (this.unlockListenersAttached || this.isUnlocked) return;

    const unlockHandler = () => {
      this.isUnlocked = true;
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }

      // Play subtle unlock chime via WebAudio synth
      this.synthesizeChime([440, 554, 659], 0.15);

      container.removeEventListener('pointerdown', unlockHandler);
      container.removeEventListener('keydown', unlockHandler);
    };

    container.addEventListener('pointerdown', unlockHandler, { once: true });
    container.addEventListener('keydown', unlockHandler, { once: true });
    this.unlockListenersAttached = true;
  }

  public playCue(cueId: CueId, overrideVolume?: number): Howl | null {
    const cueSpec = getSoundCue(cueId);
    if (!cueSpec) {
      console.warn(`[AudioEngine] Sound cue "${cueId}" not registered.`);
      return null;
    }

    const effectiveGain = calculateEffectiveVolume(cueSpec.bus, this.volumes, this.isDucked);
    const finalVolume = (overrideVolume ?? cueSpec.volume ?? 1.0) * effectiveGain;

    if (finalVolume <= 0) return null;

    // WebAudio Synthesizer fallback for immediate audible feedback
    this.playSynthesizedCue(cueId, finalVolume);

    let howl = this.activeHowls.get(cueId);
    if (!howl) {
      howl = new Howl({
        src: [`/audio/${cueSpec.bus}/${cueId.replace(/\./g, '_')}.mp3`],
        loop: cueSpec.loop ?? false,
        volume: finalVolume,
        html5: cueSpec.bus === 'music',
        onloaderror: () => {
          // Quietly fall back to WebAudio synthesis if file is not on disk yet
        },
      });
      this.activeHowls.set(cueId, howl);
    } else {
      howl.volume(finalVolume);
    }

    try {
      howl.play();
    } catch (e) {
      // Ignored for missing files; synth fallback handles sound
    }

    return howl;
  }

  /**
   * Synthesize real WebAudio sound effects when physical MP3 files are absent.
   */
  private playSynthesizedCue(cueId: CueId, volume: number): void {
    if (cueId === 'sfx.interact') {
      this.synthesizeChime([523.25, 659.25], 0.12, volume); // C5 -> E5
    } else if (cueId === 'sfx.sigil.cast') {
      this.synthesizeChime([523.25, 659.25, 783.99, 1046.5], 0.25, volume); // C5 -> E5 -> G5 -> C6
    } else if (cueId === 'sfx.sigil.fail') {
      this.synthesizeBuzz(220, 0.2, volume); // Low A3 buzz
    } else if (cueId === 'sfx.secret') {
      this.synthesizeChime([659.25, 830.61, 987.77, 1318.51], 0.3, volume); // E5 major
    }
  }

  private synthesizeChime(freqs: number[], durationSec: number, volumeGain: number = 0.5): void {
    try {
      const ctx = Howler.ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!ctx || ctx.state === 'suspended') return;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        const startTime = ctx.currentTime + idx * 0.05;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.2 * volumeGain, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + durationSec);
      });
    } catch (e) {
      // AudioContext unavailable
    }
  }

  private synthesizeBuzz(freq: number, durationSec: number, volumeGain: number = 0.5): void {
    try {
      const ctx = Howler.ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!ctx || ctx.state === 'suspended') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq * 0.7, ctx.currentTime + durationSec);

      gain.gain.setValueAtTime(0.15 * volumeGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch (e) {
      // AudioContext unavailable
    }
  }

  public stopCue(cueId: CueId, fadeOutMs: number = 0): void {
    const howl = this.activeHowls.get(cueId);
    if (!howl) return;

    if (fadeOutMs > 0) {
      howl.fade(howl.volume(), 0, fadeOutMs);
      setTimeout(() => {
        howl.stop();
        this.activeHowls.delete(cueId);
      }, fadeOutMs);
    } else {
      howl.stop();
      this.activeHowls.delete(cueId);
    }
  }

  public crossfadeStem(fromCue: CueId, toCue: CueId, durationMs: number = 1500): void {
    this.stopCue(fromCue, durationMs);
    this.playCue(toCue);

    const newHowl = this.activeHowls.get(toCue);
    if (newHowl) {
      const cueSpec = getSoundCue(toCue);
      const targetGain = calculateEffectiveVolume(cueSpec?.bus || 'music', this.volumes, this.isDucked);
      newHowl.volume(0);
      newHowl.fade(0, targetGain, durationMs);
    }
  }

  public setDucking(ducked: boolean): void {
    if (this.isDucked === ducked) return;
    this.isDucked = ducked;
    this.updateAllActiveVolumes();
  }

  public setBusVolume(bus: AudioBusName, volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.volumes[bus] = clamped;
    this.saveVolumesToStorage();

    if (bus === 'master') {
      Howler.volume(clamped);
    }
    this.updateAllActiveVolumes();
  }

  public getBusVolume(bus: AudioBusName): number {
    return this.volumes[bus];
  }

  public isAudioUnlocked(): boolean {
    return this.isUnlocked;
  }

  private updateAllActiveVolumes(): void {
    for (const [cueId, howl] of this.activeHowls.entries()) {
      const cueSpec = getSoundCue(cueId);
      if (cueSpec) {
        const gain = calculateEffectiveVolume(cueSpec.bus, this.volumes, this.isDucked);
        howl.volume((cueSpec.volume ?? 1.0) * gain);
      }
    }
  }

  private loadVolumesFromStorage(): void {
    try {
      const stored = localStorage.getItem('everbloom.audio.volumes');
      if (stored) {
        this.volumes = { ...DEFAULT_BUS_VOLUMES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[AudioEngine] Could not load audio volumes:', e);
    }
  }

  private saveVolumesToStorage(): void {
    try {
      localStorage.setItem('everbloom.audio.volumes', JSON.stringify(this.volumes));
    } catch (e) {
      console.warn('[AudioEngine] Could not save audio volumes:', e);
    }
  }
}

export const globalAudioEngine = new AudioEngine();
