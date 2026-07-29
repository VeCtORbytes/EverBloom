import { describe, it, expect, beforeEach } from 'vitest';
import { calculateEffectiveVolume, DEFAULT_BUS_VOLUMES, DUCKING_FACTOR } from '@/engine/audio/buses';
import { registerSoundCue, getSoundCue } from '@/engine/audio/cues';

describe('Audio Engine Math & Cues', () => {
  beforeEach(() => {
    registerSoundCue({ id: 'sfx.test.ping', bus: 'sfx', volume: 1.0 });
    registerSoundCue({ id: 'music.test.theme', bus: 'music', volume: 0.8, loop: true });
  });

  it('calculates bus volume gains considering master volume', () => {
    const volumes = { ...DEFAULT_BUS_VOLUMES, master: 0.5, sfx: 0.8 };
    const effectiveGain = calculateEffectiveVolume('sfx', volumes, false);

    expect(effectiveGain).toBeCloseTo(0.4); // 0.5 * 0.8 = 0.4
  });

  it('attenuates sfx and ambience buses by 6dB during audio ducking', () => {
    const volumes = { ...DEFAULT_BUS_VOLUMES, master: 1.0, sfx: 1.0, ambience: 1.0, music: 1.0 };
    
    const unduckedGain = calculateEffectiveVolume('sfx', volumes, false);
    const duckedGain = calculateEffectiveVolume('sfx', volumes, true);

    expect(unduckedGain).toBe(1.0);
    expect(duckedGain).toBeCloseTo(DUCKING_FACTOR); // ~0.501 (-6dB)

    // Music bus should NOT be ducked
    const musicDuckedGain = calculateEffectiveVolume('music', volumes, true);
    expect(musicDuckedGain).toBe(1.0);
  });

  it('registers and retrieves sound cues correctly', () => {
    const cue = getSoundCue('sfx.test.ping');
    expect(cue).toBeDefined();
    expect(cue?.bus).toBe('sfx');

    const missingCue = getSoundCue('nonexistent.cue');
    expect(missingCue).toBeUndefined();
  });
});
