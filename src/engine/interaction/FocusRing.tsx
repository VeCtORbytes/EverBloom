import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { globalInteractionRegistry } from './InteractionRegistry';

export const FocusRing: React.FC = () => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ringRef.current) return;

    const focusedItem = globalInteractionRegistry.getFocusedItem();
    if (!focusedItem || !globalInteractionRegistry.isKeyboardActive()) {
      ringRef.current.visible = false;
      return;
    }

    ringRef.current.visible = true;
    const [fx, fy, fz] = focusedItem.position;

    // Smooth lerp ring position to focused item
    ringRef.current.position.lerp(new THREE.Vector3(fx, fy, fz), delta * 12);

    // Pulse scale animation
    const pulse = 1.0 + Math.sin(state.clock.getElapsedTime() * 8) * 0.08;
    ringRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <mesh ref={ringRef} visible={false}>
      <ringGeometry args={[0.7, 0.78, 32]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
};
