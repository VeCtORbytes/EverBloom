import React from 'react';
import { LanternId } from '@/types/ids';
import { usePrologueStore } from './prologue.store';
import { Interactable } from '@/engine/interaction/Interactable';

interface LanternConfig {
  id: LanternId;
  name: string;
  color: string;
  position: [number, number, number];
  tabIndex: number;
}

const LANTERNS: LanternConfig[] = [
  { id: 'amber', name: 'Amber Lantern', color: '#f59e0b', position: [-2.2, -1.2, 0], tabIndex: 2 },
  { id: 'rose', name: 'Rose Lantern', color: '#ec4899', position: [-0.75, -1.2, 0], tabIndex: 3 },
  { id: 'jade', name: 'Jade Lantern', color: '#10b981', position: [0.75, -1.2, 0], tabIndex: 4 },
  { id: 'violet', name: 'Violet Lantern', color: '#8b5cf6', position: [2.2, -1.2, 0], tabIndex: 5 },
];

export const LanternPedestals: React.FC = () => {
  const step = usePrologueStore((s) => s.step);
  const chooseLantern = usePrologueStore((s) => s.chooseLantern);

  if (step === 'darkness' || step === 'first_thread') return null;

  return (
    <group>
      {LANTERNS.map((lantern) => (
        <Interactable
          key={lantern.id}
          id={`lantern_${lantern.id}`}
          position={lantern.position}
          tabIndex={lantern.tabIndex}
          onThread={() => chooseLantern(lantern.id)}
        >
          <group>
            {/* Pedestal Base */}
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
              <meshStandardMaterial color="#1f191b" roughness={0.8} />
            </mesh>

            {/* Glowing Lantern Orb */}
            <mesh position={[0, 0.1, 0]}>
              <octahedronGeometry args={[0.32, 1]} />
              <meshStandardMaterial
                color={lantern.color}
                emissive={lantern.color}
                emissiveIntensity={0.8}
                roughness={0.1}
              />
            </mesh>

            <pointLight position={[0, 0.2, 0.2]} color={lantern.color} intensity={0.8} distance={2.5} />
          </group>
        </Interactable>
      ))}
    </group>
  );
};
