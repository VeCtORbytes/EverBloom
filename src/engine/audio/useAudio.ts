import { useState, useCallback } from 'react';
import { CueId } from '@/types/ids';
import { globalAudioEngine } from './AudioEngine';
import { AudioBusName } from './buses';

export function useAudio() {
  const [volumes, setVolumesState] = useState({
    master: globalAudioEngine.getBusVolume('master'),
    music: globalAudioEngine.getBusVolume('music'),
    ambience: globalAudioEngine.getBusVolume('ambience'),
    sfx: globalAudioEngine.getBusVolume('sfx'),
    voice: globalAudioEngine.getBusVolume('voice'),
  });

  const setBusVolume = useCallback((bus: AudioBusName, volume: number) => {
    globalAudioEngine.setBusVolume(bus, volume);
    setVolumesState((prev) => ({ ...prev, [bus]: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const playCue = useCallback((cueId: CueId, overrideVolume?: number) => {
    return globalAudioEngine.playCue(cueId, overrideVolume);
  }, []);

  const stopCue = useCallback((cueId: CueId, fadeOutMs: number = 0) => {
    globalAudioEngine.stopCue(cueId, fadeOutMs);
  }, []);

  const crossfadeStem = useCallback((fromCue: CueId, toCue: CueId, durationMs: number = 1500) => {
    globalAudioEngine.crossfadeStem(fromCue, toCue, durationMs);
  }, []);

  const setDucking = useCallback((isDucked: boolean) => {
    globalAudioEngine.setDucking(isDucked);
  }, []);

  return {
    volumes,
    setBusVolume,
    playCue,
    stopCue,
    crossfadeStem,
    setDucking,
    isUnlocked: globalAudioEngine.isAudioUnlocked(),
  };
}
