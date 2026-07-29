/**
 * Fixed 60Hz Clock Accumulator
 * Ensures framerate independence and prevents "spiral of death" stalls.
 */
export class EngineClock {
  public readonly targetFps: number = 60;
  public readonly fixedStepSec: number = 1 / 60; // 0.016666s
  public readonly fixedStepMs: number = 1000 / 60; // 16.666ms

  private accumulatorMs: number = 0;
  private timeScale: number = 1.0;
  private maxAccumulatorMs: number = 200; // Cap at ~12 steps max per frame to prevent spiral of death

  constructor(timeScale: number = 1.0) {
    this.timeScale = timeScale;
  }

  public setTimeScale(scale: number): void {
    this.timeScale = Math.max(0, scale);
  }

  public getTimeScale(): number {
    return this.timeScale;
  }

  /**
   * Advance clock by real-world delta milliseconds and invoke fixed tick callbacks.
   * Returns the number of fixed ticks performed in this frame update.
   */
  public advance(
    deltaMs: number,
    onFixedTick: (fixedDeltaSec: number) => void
  ): number {
    // Apply time scaling and clamp maximum delta to prevent spiral of death
    const scaledDelta = Math.min(deltaMs * this.timeScale, this.maxAccumulatorMs);
    this.accumulatorMs += scaledDelta;

    let ticksExecuted = 0;
    while (this.accumulatorMs >= this.fixedStepMs) {
      onFixedTick(this.fixedStepSec);
      this.accumulatorMs -= this.fixedStepMs;
      ticksExecuted++;
    }

    return ticksExecuted;
  }

  /**
   * Returns remaining interpolation fraction [0, 1) for smooth render blending.
   */
  public getInterpolationAlpha(): number {
    return this.accumulatorMs / this.fixedStepMs;
  }

  /**
   * Reset accumulator (useful on scene changes or unpause).
   */
  public reset(): void {
    this.accumulatorMs = 0;
  }
}

export const globalClock = new EngineClock();
