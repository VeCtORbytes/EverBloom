import React, { useState, useEffect } from 'react';
import { SettingsModal } from './Settings';

export const Overlay: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [gearOpacity, setGearOpacity] = useState<number>(1);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const handlePointerMove = () => {
      setGearOpacity(1);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!isSettingsOpen) {
          setGearOpacity(0.25);
        }
      }, 8000);
    };

    window.addEventListener('pointermove', handlePointerMove);
    idleTimer = setTimeout(() => setGearOpacity(0.25), 8000);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      clearTimeout(idleTimer);
    };
  }, [isSettingsOpen]);

  return (
    <>
      {/* Auto-fading Settings Gear Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        aria-label="Open Settings"
        style={{
          position: 'fixed',
          top: '12px',
          left: '140px',
          zIndex: 9990,
          padding: '6px 10px',
          backgroundColor: 'rgba(11, 9, 10, 0.85)',
          border: '1px solid rgba(244, 235, 217, 0.3)',
          borderRadius: '6px',
          color: '#f4ebd9',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '12px',
          opacity: gearOpacity,
          transition: 'opacity 0.5s ease',
        }}
      >
        ⚙️ Settings
      </button>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
