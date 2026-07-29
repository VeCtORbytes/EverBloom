import * as React from 'react';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StatsHUD } from '@/dev/StatsHUD';
import { SceneJumper } from '@/dev/SceneJumper';
import { useScene } from '@/engine/core/hooks';
import { ThreadTrail } from '@/engine/thread/ThreadTrail';
import { CursorMote } from '@/engine/thread/CursorMote';
import { useThread } from '@/engine/thread/useThread';

const PlaceholderMesh: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#f4ebd9"
        emissive="#f59e0b"
        emissiveIntensity={0.2}
        wireframe
      />
    </mesh>
  );
};

export const App: React.FC = () => {
  const { currentScene } = useScene();
  const { isDrawing } = useThread();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <StatsHUD />
      <SceneJumper />

      {/* Active Scene Overlay HUD */}
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
          Thread State:{' '}
          <strong style={{ color: isDrawing ? '#10b981' : '#f4ebd9' }}>
            {isDrawing ? 'Drawing' : 'Idle'}
          </strong>
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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#f59e0b" />
        <PlaceholderMesh />

        {/* Phase 3 Thread Verb */}
        <ThreadTrail />
        <CursorMote />
      </Canvas>
    </div>
  );
};

export default App;
