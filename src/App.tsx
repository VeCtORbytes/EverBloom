import * as React from 'react';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StatsHUD } from '@/dev/StatsHUD';

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
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <StatsHUD />
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
      </Canvas>
    </div>
  );
};

export default App;
