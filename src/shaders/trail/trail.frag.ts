export const trailFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vProgress;

  void main() {
    // Soft radial cross falloff from ribbon center
    float centerDist = abs(vUv.y - 0.5) * 2.0;
    float edgeGlow = smoothstep(1.0, 0.0, centerDist);

    // Tail taper along progress
    float tailFade = smoothstep(0.0, 0.3, vProgress) * smoothstep(1.0, 0.8, vProgress);

    float alpha = edgeGlow * tailFade * uOpacity;
    vec3 finalColor = mix(uColor, vec3(1.0), edgeGlow * 0.4); // Core white highlight

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
