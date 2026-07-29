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
      if (this.isUnlocked) return;
      
      // Resume Howler audio context if suspended
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
          this.isUnlocked = true;
        });
      } else {
        this.isUnlocked = true;
      }

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

    // Check if instance already running for looped music/ambience
    let howl = this.activeHowls.get(cueId);
    if (!howl) {
      howl = new Howl({
        src: [`/audio/${cueSpec.bus}/${cueId.replace(/\./g, '_')}.mp3`],
        loop: cueSpec.loop ?? false,
        volume: finalVolume,
        html5: cueSpec.bus === 'music', // Stream long music stems
      });
      this.activeHowls.set(cueId, howl);
    } else {
      howl.volume(finalVolume);
    }

    howl.play();
    return howl;
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
