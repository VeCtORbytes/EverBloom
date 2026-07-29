import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePrologueStore } from './prologue.store';
import { Interactable } from '@/engine/interaction/Interactable';

export const SproutSeedMesh: React.FC = () => {
  const seedGroupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const step = usePrologueStore((s) => s.step);
  const igniteEmber = usePrologueStore((s) => s.igniteEmber);
  const awakenSeed = usePrologueStore((s) => s.awakenSeed);

  useFrame((state, delta) => {
    if (!seedGroupRef.current || !coreMeshRef.current) return;

    const isAwakened = step === 'seed_awakened' || step === 'lantern_chosen';

    // Rotation & float motion
    seedGroupRef.current.rotation.y += delta * (isAwakened ? 0.8 : 0.2);
    const floatOffset = Math.sin(state.clock.getElapsedTime() * (isAwakened ? 3 : 1.5)) * 0.08;
    seedGroupRef.current.position.y = floatOffset;

    // Emissive pulse animation
    const pulse = 0.5 + Math.sin(state.clock.getElapsedTime() * (isAwakened ? 6 : 3)) * 0.4;
    const mat = coreMeshRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      mat.emissiveIntensity = isAwakened ? 1.5 + pulse * 0.5 : 0.3 + pulse * 0.4;
    }
  });

  const handleThreadSeed = () => {
    if (step === 'darkness') {
      igniteEmber();
      setTimeout(awakenSeed, 400);
    }
  };

  const isAwakened = step === 'seed_awakened' || step === 'lantern_chosen';

  return (
    <Interactable
      id="sprout_seed_core"
      position={[0, 0, 0]}
      tabIndex={1}
      onThread={handleThreadSeed}
    >
      <group ref={seedGroupRef}>
        {/* Core Ember / Seed Sphere */}
        <mesh ref={coreMeshRef}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>

        {/* 4 Surrounding Unfolding Petal Mesh Blades */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
          <mesh
            key={idx}
            position={[
              Math.cos(angle) * (isAwakened ? 0.6 : 0.3),
              isAwakened ? 0.2 : 0,
              Math.sin(angle) * (isAwakened ? 0.6 : 0.3),
            ]}
            rotation={[0.3, angle, 0.4]}
          >
            <coneGeometry args={[0.18, 0.7, 16]} />
            <meshStandardMaterial
              color={isAwakened ? '#10b981' : '#78350f'}
              emissive={isAwakened ? '#10b981' : '#000000'}
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}
      </group>
    </Interactable>
  );
};
