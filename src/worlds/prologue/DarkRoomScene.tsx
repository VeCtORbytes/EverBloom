import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePrologueStore } from './prologue.store';

export const DarkRoomScene: React.FC = () => {
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const step = usePrologueStore((s) => s.step);

  useFrame((_, delta) => {
    if (!ambientLightRef.current) return;

    const targetIntensity = step === 'darkness' ? 0.05 : step === 'first_thread' ? 0.2 : 0.6;
    ambientLightRef.current.intensity = THREE.MathUtils.lerp(
      ambientLightRef.current.intensity,
      targetIntensity,
      delta * 4
    );
  });

  return (
    <>
      <color attach="background" args={['#0b090a']} />
      <ambientLight ref={ambientLightRef} intensity={0.05} />
      <directionalLight position={[5, 8, 5]} intensity={0.4} color="#f4ebd9" />
    </>
  );
};
