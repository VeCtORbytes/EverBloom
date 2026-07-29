import React from 'react';
import { useSettings } from '@/engine/save/useSettings';
import { useSave } from '@/engine/save/useSave';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const { resetSave } = useSave();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 9, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        color: '#f4ebd9',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '420px',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: '#161315',
          border: '1px solid rgba(244, 235, 217, 0.25)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>⚙️ Settings & Accessibility</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#f4ebd9',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Accessibility Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', color: '#f59e0b', borderBottom: '1px solid rgba(244,235,217,0.1)', paddingBottom: '4px' }}>
            Accessibility Options
          </h3>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span>Reduced Motion (Halve speed & camera moves)</span>
            <input
              type="checkbox"
              checked={settings.reducedMotion === true}
              onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span>Hold to Cast Sigils (No gesture required)</span>
            <input
              type="checkbox"
              checked={settings.holdToCast}
              onChange={(e) => updateSettings({ holdToCast: e.target.checked })}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span>Display Subtitles & Captions</span>
            <input
              type="checkbox"
              checked={settings.captions}
              onChange={(e) => updateSettings({ captions: e.target.checked })}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span>Reduce Screen Flashing</span>
            <input
              type="checkbox"
              checked={settings.reduceFlashing}
              onChange={(e) => updateSettings({ reduceFlashing: e.target.checked })}
            />
          </label>
        </div>

        {/* Audio Volumes Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', color: '#f59e0b', borderBottom: '1px solid rgba(244,235,217,0.1)', paddingBottom: '4px' }}>
            Audio Volumes
          </h3>

          {(['master', 'music', 'ambience', 'sfx', 'voice'] as const).map((bus) => (
            <label key={bus} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ textTransform: 'capitalize' }}>{bus} Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volumes[bus]}
                onChange={(e) =>
                  updateSettings({
                    volumes: { ...settings.volumes, [bus]: parseFloat(e.target.value) },
                  })
                }
                style={{ width: '120px' }}
              />
            </label>
          ))}
        </div>

        {/* Data Reset Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(244,235,217,0.1)' }}>
          <button
            onClick={() => {
              if (window.confirm('Reset all story progress? (Accessibility choices will be preserved)')) {
                resetSave();
                onClose();
              }
            }}
            style={{
              padding: '8px 14px',
              backgroundColor: 'rgba(248, 113, 113, 0.15)',
              border: '1px solid #f87171',
              color: '#f87171',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
};
