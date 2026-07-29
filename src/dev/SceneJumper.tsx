import React, { useState } from 'react';
import { useScene } from '@/engine/core/hooks';
import { SceneState } from '@/engine/core/sceneMachine';

const ALL_SCENES: SceneState[] = [
  'boot',
  'prologue',
  'garden',
  'school',
  'steeping',
  'skybridge',
  'stillwater',
  'ascent',
  'everbloom',
  'credits',
  'freeroam',
];

export const SceneJumper: React.FC = () => {
  const { currentScene, isTransitioning, transitionTo } = useScene();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [force, setForce] = useState<boolean>(true);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '12px',
        right: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '6px 12px',
          backgroundColor: 'rgba(11, 9, 10, 0.85)',
          border: '1px solid rgba(244, 235, 217, 0.3)',
          borderRadius: '6px',
          color: '#f4ebd9',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>🎬 Scene: <strong>{currentScene}</strong></span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: '6px',
            padding: '12px',
            backgroundColor: 'rgba(11, 9, 10, 0.95)',
            border: '1px solid rgba(244, 235, 217, 0.3)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '200px',
          }}
        >
          <label style={{ color: '#f4ebd9', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
            />
            Force Bypass Guards
          </label>
          <div style={{ height: '1px', backgroundColor: 'rgba(244, 235, 217, 0.1)' }} />
          {ALL_SCENES.map((scene) => (
            <button
              key={scene}
              disabled={isTransitioning}
              onClick={async () => {
                await transitionTo(scene, { force });
              }}
              style={{
                padding: '6px 10px',
                textAlign: 'left',
                backgroundColor: currentScene === scene ? '#f59e0b' : 'rgba(244, 235, 217, 0.05)',
                color: currentScene === scene ? '#0b090a' : '#f4ebd9',
                border: 'none',
                borderRadius: '4px',
                cursor: isTransitioning ? 'not-allowed' : 'pointer',
                fontWeight: currentScene === scene ? 'bold' : 'normal',
                transition: 'background-color 0.15s ease',
              }}
            >
              {scene} {currentScene === scene ? ' (active)' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
