import React, { useState, useEffect } from 'react';
import { useSettings } from '@/engine/save/useSettings';
import { globalEventBus } from '@/engine/core/eventBus';

export interface CaptionLine {
  id: string;
  speaker?: string;
  text: string;
  durationMs?: number;
}

export const Captions: React.FC = () => {
  const { captions } = useSettings();
  const [activeCaption, setActiveCaption] = useState<CaptionLine | null>(null);

  useEffect(() => {
    const unsubInteract = globalEventBus.on('interactableActivated', ({ id }) => {
      if (!captions) return;
      setActiveCaption({
        id,
        speaker: 'World',
        text: `[Sound of ${id.replace(/[-_]/g, ' ')} activating]`,
        durationMs: 2000,
      });
    });

    const unsubSigil = globalEventBus.on('sigilCast', ({ sigilId }) => {
      if (!captions) return;
      setActiveCaption({
        id: sigilId,
        speaker: 'Sigil',
        text: `[Casting ${sigilId.toUpperCase()} sigil]`,
        durationMs: 2500,
      });
    });

    return () => {
      unsubInteract();
      unsubSigil();
    };
  }, [captions]);

  useEffect(() => {
    if (!activeCaption) return;
    const timer = setTimeout(() => {
      setActiveCaption(null);
    }, activeCaption.durationMs || 3000);

    return () => clearTimeout(timer);
  }, [activeCaption]);

  if (!captions || !activeCaption) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '64px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9995,
        padding: '8px 18px',
        backgroundColor: 'rgba(11, 9, 10, 0.85)',
        border: '1px solid rgba(244, 235, 217, 0.25)',
        borderRadius: '8px',
        color: '#f4ebd9',
        fontSize: '13px',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
      }}
    >
      {activeCaption.speaker && (
        <span style={{ color: '#f59e0b', fontWeight: 'bold', marginRight: '6px' }}>
          {activeCaption.speaker}:
        </span>
      )}
      <span>{activeCaption.text}</span>
    </div>
  );
};
