import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const GardenEnvironment: React.FC = () => {
  const lightMotesRef = useRef<THREE.InstancedMesh>(null);
  const count = 30;

  useFrame((state) => {
    if (!lightMotesRef.current) return;
    const dummy = new THREE.Object3D();
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const x = Math.sin(time * 0.5 + i) * 3;
      const y = Math.cos(time * 0.3 + i * 0.5) * 1.5;
      const z = Math.sin(time * 0.4 + i * 0.2) * 2 - 1;
      const scale = 0.04 + Math.sin(time * 2 + i) * 0.02;

      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      lightMotesRef.current.setMatrixAt(i, dummy.matrix);
    }
    lightMotesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <color attach="background" args={['#0d140e']} />
      <fog attach="fog" args={['#0d140e', 4, 12]} />

      <ambientLight intensity={0.6} color="#dcfce7" />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#fef08a" />
      <pointLight position={[0, 2, 0]} intensity={0.8} color="#10b981" distance={6} />

      {/* Mossy Ground Terrain Mesh */}
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20, 32, 32]} />
        <meshStandardMaterial color="#14361e" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Ancient Overgrown Stone Archway Pillars */}
      <mesh position={[-3.5, 0, -2]}>
        <cylinderGeometry args={[0.35, 0.45, 3.5, 16]} />
        <meshStandardMaterial color="#2d3748" roughness={0.7} />
      </mesh>

      <mesh position={[3.5, 0, -2]}>
        <cylinderGeometry args={[0.35, 0.45, 3.5, 16]} />
        <meshStandardMaterial color="#2d3748" roughness={0.7} />
      </mesh>

      {/* Floating Light Motes */}
      <instancedMesh ref={lightMotesRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
      </instancedMesh>
    </>
  );
};
