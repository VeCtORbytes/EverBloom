import React, { useEffect } from 'react';
import { GardenEnvironment } from './GardenEnvironment';
import { GardenGates } from './GardenGates';
import { MushroomSecret } from './MushroomSecret';
import { globalEventBus } from '@/engine/core/eventBus';
import { globalAudioEngine } from '@/engine/audio/AudioEngine';

export const GardenWorld: React.FC = () => {
  useEffect(() => {
    globalEventBus.emit('worldEntered', { worldId: 'garden' });
    globalAudioEngine.playCue('music.garden_bed');
  }, []);

  return (
    <>
      <GardenEnvironment />
      <GardenGates />
      <MushroomSecret />
    </>
  );
};
