import { QualityTier } from '@/types/ids';
import { globalEventBus } from './eventBus';

export class QualityMonitor {
  private currentTier: QualityTier = 'high';
  private frameTimes: number[] = [];
  private lowFpsDurationMs: number = 0;
  private readonly lowFpsThresholdMs: number = 1000 / 45; // ~22.22ms (sub-45fps)
  private readonly hysteresisDurationMs: number = 3000; // 3 seconds sustained
  private hasDowngraded: boolean = false;

  constructor() {
    this.currentTier = detectQualityTier();
  }

  public getTier(): QualityTier {
    return this.currentTier;
  }

  public setTier(tier: QualityTier): void {
    if (this.currentTier !== tier) {
      const prev = this.currentTier;
      this.currentTier = tier;
      globalEventBus.emit('qualityChanged', { from: prev, to: tier });
    }
  }

  /**
   * Record frame time in milliseconds and trigger adaptive downgrade if sub-45fps for 3s.
   */
  public recordFrame(deltaMs: number): void {
    if (this.hasDowngraded || this.currentTier === 'low') return;

    this.frameTimes.push(deltaMs);
    if (this.frameTimes.length > 180) {
      this.frameTimes.shift();
    }

    if (deltaMs > this.lowFpsThresholdMs) {
      this.lowFpsDurationMs += deltaMs;
    } else {
      this.lowFpsDurationMs = Math.max(0, this.lowFpsDurationMs - deltaMs * 0.5);
    }

    if (this.lowFpsDurationMs >= this.hysteresisDurationMs) {
      const nextTier: QualityTier = this.currentTier === 'high' ? 'medium' : 'low';
      console.info(`[QualityMonitor] Sub-45fps sustained for 3s. Auto-downgrading quality from ${this.currentTier} to ${nextTier}.`);
      this.setTier(nextTier);
      this.hasDowngraded = true;
    }
  }

  public reset(): void {
    this.frameTimes = [];
    this.lowFpsDurationMs = 0;
    this.hasDowngraded = false;
  }
}

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

    return 'high';
  } catch (e) {
    console.warn('Quality detection failed, defaulting to medium quality:', e);
    return 'medium';
  }
}

export const globalQualityMonitor = new QualityMonitor();
