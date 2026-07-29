import { CueId } from '@/types/ids';

export interface SoundCueSpec {
  id: CueId;
  bus: 'music' | 'ambience' | 'sfx' | 'voice';
  volume?: number;
  loop?: boolean;
}

const registeredCues: Map<CueId, SoundCueSpec> = new Map();

export function registerSoundCue(spec: SoundCueSpec): void {
  registeredCues.set(spec.id, spec);
}

export function registerSoundCues(specs: SoundCueSpec[]): void {
  specs.forEach((s) => registeredCues.set(s.id, s));
}

export function getSoundCue(id: CueId): SoundCueSpec | undefined {
  return registeredCues.get(id);
}

export function getAllSoundCues(): SoundCueSpec[] {
  return Array.from(registeredCues.values());
}
