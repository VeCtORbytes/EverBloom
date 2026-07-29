import React, { useState } from 'react';
import { useGardenStore } from './garden.store';
import { Interactable } from '@/engine/interaction/Interactable';

export const MushroomSecret: React.FC = () => {
  const [isFound, setIsFound] = useState<boolean>(false);
  const collectSecret = useGardenStore((s) => s.collectSecret);

  const handleThreadMushroom = () => {
    if (!isFound) {
      setIsFound(true);
      collectSecret('mushroom_secret');
    }
  };

  return (
    <Interactable
      id="mushroom_secret"
      position={[1.8, -0.6, 1]}
      tabIndex={4}
      onThread={handleThreadMushroom}
    >
      <group>
        {/* Cap 1 */}
        <mesh position={[-0.15, 0.2, 0]}>
          <coneGeometry args={[0.22, 0.25, 16]} />
          <meshStandardMaterial
            color={isFound ? '#f59e0b' : '#3b82f6'}
            emissive={isFound ? '#f59e0b' : '#3b82f6'}
            emissiveIntensity={isFound ? 1.2 : 0.4}
          />
        </mesh>

        {/* Cap 2 */}
        <mesh position={[0.15, 0.15, 0.1]}>
          <coneGeometry args={[0.16, 0.2, 16]} />
          <meshStandardMaterial
            color={isFound ? '#f59e0b' : '#60a5fa'}
            emissive={isFound ? '#f59e0b' : '#60a5fa'}
            emissiveIntensity={isFound ? 1.2 : 0.4}
          />
        </mesh>

        {/* Stem */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.3, 12]} />
          <meshStandardMaterial color="#f4ebd9" roughness={0.5} />
        </mesh>
      </group>
    </Interactable>
  );
};
