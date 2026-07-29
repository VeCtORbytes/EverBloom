import React from 'react';

interface SeedPulseProgressProps {
  progress: number; // [0, 1]
  visible?: boolean;
}

export const SeedPulseProgress: React.FC<SeedPulseProgressProps> = ({ progress, visible = true }) => {
  if (!visible || progress >= 1.0) return null;

  // Pulse period accelerates from 2.5s (0%) down to 0.4s (100%)
  const pulseDurationSec = 2.5 - progress * 2.1;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Diegetic Sprout Seed Pulse Glow */}
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#f59e0b',
          boxShadow: '0 0 20px #f59e0b, 0 0 40px #f59e0b',
          animation: `seedPulse ${pulseDurationSec}s ease-in-out infinite`,
        }}
      />
      <style>{`
        @keyframes seedPulse {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.3);
            opacity: 1.0;
          }
        }
      `}</style>
      <div style={{ color: '#f4ebd9', fontSize: '11px', fontFamily: 'monospace', opacity: 0.7 }}>
        {Math.round(progress * 100)}%
      </div>
    </div>
  );
};
