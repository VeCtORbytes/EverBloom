import { QualityTier } from '@/types/ids';

/**
 * Detect hardware capability tier at boot time based on GPU renderer string and performance traits.
 */
export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'high';

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return 'low';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
      
      // Known low-power/integrated profiles
      if (
        renderer.includes('intel') ||
        renderer.includes('swiftshader') ||
        renderer.includes('llvmpipe') ||
        renderer.includes('mali-4') ||
        renderer.includes('adreno 3')
      ) {
        return 'medium';
      }
    }

    // Default to high quality for modern GPUs
    return 'high';
  } catch (e) {
    console.warn('Quality detection failed, defaulting to medium quality:', e);
    return 'medium';
  }
}
