import { describe, it, expect, beforeEach } from 'vitest';
import { ThreadController } from '@/engine/thread/ThreadController';
import { useThreadStore } from '@/engine/thread/thread.store';

describe('ThreadController & ThreadStore', () => {
  let controller: ThreadController;

  beforeEach(() => {
    controller = new ThreadController();
    useThreadStore.setState({ mode: 'free', color: '#f59e0b', isDrawing: false });
  });

  it('initializes with default free mode and amber color', () => {
    expect(useThreadStore.getState().mode).toBe('free');
    expect(useThreadStore.getState().color).toBe('#f59e0b');
  });

  it('clamps ring buffer to max 256 points', () => {
    const now = performance.now();
    for (let i = 0; i < 300; i++) {
      controller.addPoint({
        x: i,
        y: i,
        z: 0,
        timestamp: now,
        speed: 1.0,
        pressure: 0.5,
      });
    }

    const points = controller.getPoints();
    expect(points.length).toBe(256);
    expect(points[0].x).toBe(44); // First 44 points evicted (300 - 256 = 44)
  });

  it('prunes points older than tail lifetime (600ms)', () => {
    const now = 10000;
    controller.addPoint({ x: 1, y: 1, z: 0, timestamp: now - 700, speed: 1.0, pressure: 0.5 }); // Expired
    controller.addPoint({ x: 2, y: 2, z: 0, timestamp: now - 200, speed: 1.0, pressure: 0.5 }); // Valid

    expect(controller.getPoints().length).toBe(2);
    controller.update(now);
    expect(controller.getPoints().length).toBe(1);
    expect(controller.getPoints()[0].x).toBe(2);
  });
});
