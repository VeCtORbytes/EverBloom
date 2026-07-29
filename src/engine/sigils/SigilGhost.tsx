import React from 'react';
import { SigilId } from '@/types/ids';
import { getRegisteredSigilTemplate } from './templates';

interface SigilGhostProps {
  sigilId: SigilId | null;
  visible: boolean;
}

export const SigilGhost: React.FC<SigilGhostProps> = ({ sigilId, visible }) => {
  if (!visible || !sigilId) return null;

  const template = getRegisteredSigilTemplate(sigilId);
  if (!template) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 888,
        opacity: 0.75,
        transition: 'opacity 0.5s ease',
        filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))',
      }}
    >
      <svg
        width="250"
        height="250"
        viewBox="0 0 250 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={template.svgPath}
          stroke="#f59e0b"
          strokeWidth="3"
          strokeDasharray="6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          textAlign: 'center',
          color: '#f4ebd9',
          fontSize: '11px',
          fontFamily: 'sans-serif',
          marginTop: '8px',
          letterSpacing: '1px',
        }}
      >
        Trace <strong>{template.name}</strong> sigil
      </div>
    </div>
  );
};
