export type AudioBusName = 'master' | 'music' | 'ambience' | 'sfx' | 'voice';

export interface BusVolumeMap {
  master: number;
  music: number;
  ambience: number;
  sfx: number;
  voice: number;
}

export const DEFAULT_BUS_VOLUMES: BusVolumeMap = {
  master: 1.0,
  music: 0.8,
  ambience: 0.7,
  sfx: 0.9,
  voice: 1.0,
};

export const DUCKING_ATTENUATION_DB = 6; // 6dB drop during ducking
export const DUCKING_FACTOR = Math.pow(10, -DUCKING_ATTENUATION_DB / 20); // ~0.501

/**
 * Calculates effective volume gain [0, 1] for a specific bus, considering master volume and ducking.
 */
export function calculateEffectiveVolume(
  bus: Exclude<AudioBusName, 'master'>,
  volumes: BusVolumeMap,
  isDucked: boolean = false
): number {
  const master = Math.max(0, Math.min(1, volumes.master));
  const busGain = Math.max(0, Math.min(1, volumes[bus]));
  const duckMultiplier = isDucked && (bus === 'ambience' || bus === 'sfx') ? DUCKING_FACTOR : 1.0;

  return master * busGain * duckMultiplier;
}
