import { useState, useCallback, useEffect } from 'react';
import { Settings } from './schema';
import { globalSaveManager } from './save';
import { globalClock } from '@/engine/core/clock';
import { globalSigilController } from '@/engine/sigils/SigilController';
import { globalAudioEngine } from '@/engine/audio/AudioEngine';
import { AudioBusName } from '@/engine/audio/buses';

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(globalSaveManager.getSettings());

  const applySettingsEngineEffects = useCallback((s: Settings) => {
    // Plumb reducedMotion to engine clock speed multiplier
    if (s.reducedMotion) {
      globalClock.setTimeScale(0.5);
    } else {
      globalClock.setTimeScale(1.0);
    }

    // Plumb holdToCast to SigilController
    globalSigilController.setHoldToCast(s.holdToCast);

    // Plumb bus volumes to AudioEngine
    Object.entries(s.volumes).forEach(([bus, gain]) => {
      globalAudioEngine.setBusVolume(bus as AudioBusName, gain);
    });
  }, []);

  useEffect(() => {
    applySettingsEngineEffects(settings);
  }, [settings, applySettingsEngineEffects]);

  const updateSettings = useCallback((update: Partial<Settings>) => {
    const updated = globalSaveManager.writeSettings(update);
    setSettingsState({ ...updated });
    applySettingsEngineEffects(updated);
  }, [applySettingsEngineEffects]);

  return {
    settings,
    updateSettings,
    reducedMotion: settings.reducedMotion,
    holdToCast: settings.holdToCast,
    captions: settings.captions,
    reduceFlashing: settings.reduceFlashing,
  };
}
