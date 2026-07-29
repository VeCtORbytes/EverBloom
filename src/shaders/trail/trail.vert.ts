export const trailVertexShader = /* glsl */ `
  attribute float uProgress; // [0, 1] along ribbon tail
  attribute float uWidth;    // Dynamic ribbon width
  attribute vec2 aSide;      // [-1, 1] perpendicular expansion vector

  varying vec2 vUv;
  varying float vProgress;

  void main() {
    vUv = uv;
    vProgress = uProgress;

    vec3 offsetPos = position + vec3(aSide * uWidth * 0.05, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(offsetPos, 1.0);
  }
`;
