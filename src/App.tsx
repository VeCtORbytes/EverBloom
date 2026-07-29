import * as React from 'react';
import { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { StatsHUD } from '@/dev/StatsHUD';
import { SceneJumper } from '@/dev/SceneJumper';
import { SigilTrainer } from '@/dev/SigilTrainer';
import { SigilGhost } from '@/engine/sigils/SigilGhost';
import { useScene } from '@/engine/core/hooks';
import { ThreadTrail } from '@/engine/thread/ThreadTrail';
import { CursorMote } from '@/engine/thread/CursorMote';
import { useThread } from '@/engine/thread/useThread';
import { useSigil } from '@/engine/sigils/useSigil';
import { Interactable } from '@/engine/interaction/Interactable';
import { FocusRing } from '@/engine/interaction/FocusRing';
import { globalInteractionRegistry } from '@/engine/interaction/InteractionRegistry';
import { globalThreadController } from '@/engine/thread/ThreadController';

const InteractiveSceneContent: React.FC = () => {
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  useFrame(() => {
    // Continuously check broad-phase spatial hover hit test
    const [cursorX, cursorY] = globalThreadController.getCursorPos();
    globalInteractionRegistry.updateHover(cursorX, cursorY);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#f59e0b" />

      {/* Phase 5 Interactive Test Objects */}
      <Interactable
        id="lantern-amber"
        position={[-2, 0.5, 0]}
        tabIndex={1}
        onThread={() => setActiveMessage('Amber Lantern Threaded!')}
      >
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} />
        </mesh>
      </Interactable>

      <Interactable
        id="magic-book"
        position={[0, -0.8, 0]}
        tabIndex={2}
        onThread={() => setActiveMessage('Magic Book Beckoned!')}
      >
        <mesh>
          <boxGeometry args={[1.2, 0.3, 0.8]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.4} />
        </mesh>
      </Interactable>

      <Interactable
        id="sprout-seed"
        position={[2, 0.5, 0]}
        tabIndex={3}
        onThread={() => setActiveMessage('Sprout Seed Kindled!')}
      >
        <mesh>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
      </Interactable>

      <FocusRing />
      <ThreadTrail />
      <CursorMote />

      {activeMessage && (
        <MessageToast message={activeMessage} onDismiss={() => setActiveMessage(null)} />
      )}
    </>
  );
};

const MessageToast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        padding: '10px 20px',
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
        color: '#0b090a',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '13px',
        fontFamily: 'sans-serif',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.5)',
      }}
    >
      ✨ {message}
    </div>
  );
};

export const App: React.FC = () => {
  const { currentScene } = useScene();
  const { isDrawing } = useThread();
  const { assistActive } = useSigil();

  // Keyboard navigation setup (Tab, Enter, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        globalInteractionRegistry.cycleKeyboardFocus(e.shiftKey);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (globalInteractionRegistry.isKeyboardActive()) {
          e.preventDefault();
          globalInteractionRegistry.activateFocused();
        }
      } else if (e.key === 'Escape') {
        globalInteractionRegistry.clearKeyboardFocus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <StatsHUD />
      <SceneJumper />
      <SigilTrainer />

      {/* Ghost Path Assist Overlay */}
      <SigilGhost sigilId="kindle" visible={assistActive} />

      {/* Active Scene & Thread Overlay HUD */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          padding: '8px 16px',
          backgroundColor: 'rgba(11, 9, 10, 0.75)',
          border: '1px solid rgba(244, 235, 217, 0.2)',
          borderRadius: '20px',
          color: '#f4ebd9',
          fontSize: '13px',
          fontFamily: 'sans-serif',
          pointerEvents: 'none',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <span>
          Active Scene: <strong style={{ color: '#f59e0b' }}>{currentScene}</strong>
        </span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>
          Thread:{' '}
          <strong style={{ color: isDrawing ? '#10b981' : '#f4ebd9' }}>
            {isDrawing ? 'Drawing' : 'Idle'}
          </strong>
        </span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span style={{ fontSize: '11px', opacity: 0.8 }}>
          Press <strong>Tab</strong> to navigate objects
        </span>
      </div>

      <Canvas
        dpr={[1, 1.75]}
        gl={{
          powerPreference: 'high-performance',
          antialias: false,
          alpha: false,
        }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: '#0b090a' }}
      >
        <InteractiveSceneContent />
      </Canvas>
    </div>
  );
};

export default App;
