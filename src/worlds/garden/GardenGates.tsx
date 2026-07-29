import React from 'react';
import { WorldId } from '@/types/ids';
import { useSceneStore } from '@/engine/core/sceneMachine';
import { Interactable } from '@/engine/interaction/Interactable';

interface GateConfig {
  id: string;
  name: string;
  targetWorld: WorldId;
  position: [number, number, number];
  color: string;
  tabIndex: number;
}

const GATES: GateConfig[] = [
  {
    id: 'school_gate',
    name: 'Lantern School Gate',
    targetWorld: 'school',
    position: [-2.5, 0.2, 0],
    color: '#f59e0b',
    tabIndex: 1,
  },
  {
    id: 'steeping_gate',
    name: 'Steeping Room Gate',
    targetWorld: 'steeping',
    position: [0, 0.2, -1],
    color: '#8b5cf6',
    tabIndex: 2,
  },
  {
    id: 'stillwater_gate',
    name: 'Stillwater Basin Gate',
    targetWorld: 'stillwater',
    position: [2.5, 0.2, 0],
    color: '#10b981',
    tabIndex: 3,
  },
];

export const GardenGates: React.FC = () => {
  const handleEnterWorld = (targetWorld: WorldId) => {
    useSceneStore.getState().transitionTo(targetWorld);
  };

  return (
    <group>
      {GATES.map((gate) => (
        <Interactable
          key={gate.id}
          id={gate.id}
          position={gate.position}
          tabIndex={gate.tabIndex}
          onThread={() => handleEnterWorld(gate.targetWorld)}
        >
          <group>
            {/* Gate Arch Portal Geometry */}
            <mesh position={[0, 0.4, 0]}>
              <torusGeometry args={[0.75, 0.08, 16, 32, Math.PI]} />
              <meshStandardMaterial color="#374151" roughness={0.6} />
            </mesh>

            {/* Inner Portal Light Disc */}
            <mesh position={[0, 0.4, 0]}>
              <circleGeometry args={[0.65, 32]} />
              <meshStandardMaterial
                color={gate.color}
                emissive={gate.color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.7}
              />
            </mesh>

            <pointLight position={[0, 0.4, 0.3]} color={gate.color} intensity={1.2} distance={3} />
          </group>
        </Interactable>
      ))}
    </group>
  );
};
