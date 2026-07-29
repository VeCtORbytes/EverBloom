import { describe, it, expect } from 'vitest';
import { detectQualityTier } from '@/engine/core/quality';

describe('detectQualityTier', () => {
  it('returns a valid quality tier', () => {
    const tier = detectQualityTier();
    expect(['low', 'medium', 'high']).toContain(tier);
  });
});
