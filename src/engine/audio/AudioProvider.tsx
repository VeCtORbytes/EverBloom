import React, { useEffect } from 'react';
import { globalAudioEngine } from './AudioEngine';
import { globalEventBus } from '@/engine/core/eventBus';

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Attach silent autoplay unlock listener to pointerdown/keydown
    globalAudioEngine.attachUnlockListener();

    // Subscribe event bus to sound effects
    const unsubCast = globalEventBus.on('sigilCast', () => {
      globalAudioEngine.playCue('sfx.sigil.cast');
    });

    const unsubFail = globalEventBus.on('sigilFailed', () => {
      globalAudioEngine.playCue('sfx.sigil.fail');
    });

    const unsubInteract = globalEventBus.on('interactableActivated', () => {
      globalAudioEngine.playCue('sfx.interact');
    });

    const unsubSecret = globalEventBus.on('secretFound', () => {
      globalAudioEngine.playCue('sfx.secret');
    });

    return () => {
      unsubCast();
      unsubFail();
      unsubInteract();
      unsubSecret();
    };
  }, []);

  return <>{children}</>;
};
