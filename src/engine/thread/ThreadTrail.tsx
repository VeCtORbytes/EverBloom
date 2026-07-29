import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { globalThreadController } from './ThreadController';
import { useThreadStore } from './thread.store';
import { trailVertexShader } from '@/shaders/trail/trail.vert';
import { trailFragmentShader } from '@/shaders/trail/trail.frag';

export const ThreadTrail: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const trailColorHex = useThreadStore((state) => state.color);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(trailColorHex) },
      uOpacity: { value: 1.0 },
    }),
    [trailColorHex]
  );

  useFrame(() => {
    globalThreadController.update();
    const points = globalThreadController.getPoints();

    if (!geomRef.current || points.length < 2) {
      if (geomRef.current) {
        geomRef.current.setDrawRange(0, 0);
      }
      return;
    }

    const count = points.length;
    const vertexCount = count * 2;
    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const sides = new Float32Array(vertexCount * 2);
    const progresses = new Float32Array(vertexCount);
    const widths = new Float32Array(vertexCount);

    for (let i = 0; i < count; i++) {
      const p = points[i];
      const progress = i / (count - 1);
      const width = Math.min(0.2, 0.05 + p.speed * 0.05);

      // Top vertex
      positions[i * 6] = p.x;
      positions[i * 6 + 1] = p.y + width * 0.5;
      positions[i * 6 + 2] = p.z;
      uvs[i * 4] = progress;
      uvs[i * 4 + 1] = 1.0;
      sides[i * 4] = 0;
      sides[i * 4 + 1] = 1;
      progresses[i * 2] = progress;
      widths[i * 2] = width;

      // Bottom vertex
      positions[i * 6 + 3] = p.x;
      positions[i * 6 + 4] = p.y - width * 0.5;
      positions[i * 6 + 5] = p.z;
      uvs[i * 4 + 2] = progress;
      uvs[i * 4 + 3] = 0.0;
      sides[i * 4 + 2] = 0;
      sides[i * 4 + 3] = -1;
      progresses[i * 2 + 1] = progress;
      widths[i * 2 + 1] = width;
    }

    const geom = geomRef.current;
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setAttribute('aSide', new THREE.BufferAttribute(sides, 2));
    geom.setAttribute('uProgress', new THREE.BufferAttribute(progresses, 1));
    geom.setAttribute('uWidth', new THREE.BufferAttribute(widths, 1));

    // Indices triangle strip
    const indices: number[] = [];
    for (let i = 0; i < count - 1; i++) {
      const v = i * 2;
      indices.push(v, v + 1, v + 2);
      indices.push(v + 2, v + 1, v + 3);
    }

    geom.setIndex(indices);
    geom.setDrawRange(0, indices.length);
    geom.computeBoundingSphere();

    if (matRef.current) {
      matRef.current.uniforms.uColor.value.set(trailColorHex);
    }
  });

  return (
    <mesh ref={meshRef}>
      <bufferGeometry ref={geomRef} />
      <shaderMaterial
        ref={matRef}
        vertexShader={trailVertexShader}
        fragmentShader={trailFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};
