import { describe, it, expect, vi } from 'vitest';
import { EngineClock } from '@/engine/core/clock';

describe('EngineClock', () => {
  it('accumulates time and triggers ticks at 60Hz (16.666ms per tick)', () => {
    const clock = new EngineClock(1.0);
    const tickSpy = vi.fn();

    // Advance 2 full ticks (approx 33.34ms) -> should execute exactly 2 ticks
    const ticks = clock.advance(clock.fixedStepMs * 2 + 0.1, tickSpy);
    expect(ticks).toBe(2);
    expect(tickSpy).toHaveBeenCalledTimes(2);
    expect(tickSpy).toHaveBeenCalledWith(1 / 60);
  });

  it('clamps maximum delta to prevent spiral of death stalls', () => {
    const clock = new EngineClock(1.0);
    const tickSpy = vi.fn();

    // Advance 1000ms stall -> clamped to 200ms (12 ticks)
    const ticks = clock.advance(1000, tickSpy);
    expect(ticks).toBe(12);
    expect(tickSpy).toHaveBeenCalledTimes(12);
  });

  it('respects timeScale multiplier', () => {
    const clock = new EngineClock(0.5); // Half speed
    const tickSpy = vi.fn();

    // Advance 34ms at half speed (17ms scaled) -> 1 tick
    const ticks = clock.advance(34, tickSpy);
    expect(ticks).toBe(1);
  });
});
