import React, { useEffect } from 'react';
import { DarkRoomScene } from './DarkRoomScene';
import { SproutSeedMesh } from './SproutSeedMesh';
import { LanternPedestals } from './LanternPedestals';
import { usePrologueStore } from './prologue.store';
import { useSceneStore } from '@/engine/core/sceneMachine';
import { globalEventBus } from '@/engine/core/eventBus';

export const PrologueWorld: React.FC = () => {
  const step = usePrologueStore((s) => s.step);
  const chosenLantern = usePrologueStore((s) => s.chosenLantern);

  useEffect(() => {
    globalEventBus.emit('worldEntered', { worldId: 'prologue' });
  }, []);

  useEffect(() => {
    if (step === 'lantern_chosen' && chosenLantern) {
      const timer = setTimeout(() => {
        useSceneStore.getState().transitionTo('garden');
      }, 1500);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [step, chosenLantern]);

  return (
    <>
      <DarkRoomScene />
      <SproutSeedMesh />
      <LanternPedestals />
    </>
  );
};
