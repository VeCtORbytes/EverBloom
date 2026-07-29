import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InteractableItem } from './InteractionRegistry';
import { useInteractable } from './useInteractable';

interface InteractableProps extends InteractableItem {
  children: React.ReactNode;
  scaleHover?: number; // Target hover scale factor (default 1.15)
}

export const Interactable: React.FC<InteractableProps> = ({
  children,
  scaleHover = 1.15,
  ...itemProps
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [internalHover, setInternalHover] = useState<boolean>(false);

  const { isHovered } = useInteractable({
    ...itemProps,
    onHoverStart: () => {
      setInternalHover(true);
      itemProps.onHoverStart?.();
    },
    onHoverEnd: () => {
      setInternalHover(false);
      itemProps.onHoverEnd?.();
    },
  });

  const activeHover = isHovered || internalHover;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth scale pulse interpolation
    const targetScale = activeHover ? scaleHover : 1.0;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 10
    );

    // Subtle breath float oscillation when hovered
    if (activeHover) {
      const breath = Math.sin(state.clock.getElapsedTime() * 6) * 0.04;
      groupRef.current.position.y = itemProps.position[1] + breath;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        itemProps.position[1],
        delta * 8
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={itemProps.position}
      onPointerOver={() => setInternalHover(true)}
      onPointerOut={() => setInternalHover(false)}
      onClick={() => itemProps.onThread?.()}
    >
      {children}
    </group>
  );
};
