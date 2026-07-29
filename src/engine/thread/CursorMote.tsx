import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { globalThreadController } from './ThreadController';
import { useThreadStore } from './thread.store';

export const CursorMote: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const colorHex = useThreadStore((state) => state.color);

  useFrame((state) => {
    if (!meshRef.current) return;

    const [targetX, targetY] = globalThreadController.getCursorPos();
    const time = state.clock.getElapsedTime();

    // Subtle idle Perlin-like float bob
    const bobX = Math.sin(time * 2.5) * 0.05;
    const bobY = Math.cos(time * 3.0) * 0.05;

    // Smooth lerp to target position
    meshRef.current.position.x += (targetX + bobX - meshRef.current.position.x) * 0.25;
    meshRef.current.position.y += (targetY + bobY - meshRef.current.position.y) * 0.25;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={colorHex} transparent opacity={0.9} />
    </mesh>
  );
};
