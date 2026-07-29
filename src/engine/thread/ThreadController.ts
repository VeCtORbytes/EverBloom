import { ThreadPoint, useThreadStore } from './thread.store';
import { globalEventBus } from '@/engine/core/eventBus';

export class ThreadController {
  public static readonly MAX_POINTS: number = 256;
  public static readonly RESAMPLE_DIST_PX: number = 8;
  public static readonly TAIL_LIFETIME_MS: number = 600; // Trail fades over 600ms

  private points: ThreadPoint[] = [];
  private isPointerDown: boolean = false;
  private lastScreenX: number = -1;
  private lastScreenY: number = -1;
  private lastTimestamp: number = 0;
  private cursorWorldPos: [number, number, number] = [0, 0, 0];
  private isAttached: boolean = false;

  public attach(container: HTMLElement = document.body): void {
    if (this.isAttached) return;

    container.addEventListener('pointerdown', this.onPointerDown);
    container.addEventListener('pointermove', this.onPointerMove);
    container.addEventListener('pointerup', this.onPointerUp);
    container.addEventListener('pointercancel', this.onPointerUp);
    this.isAttached = true;
  }

  public detach(container: HTMLElement = document.body): void {
    if (!this.isAttached) return;

    container.removeEventListener('pointerdown', this.onPointerDown);
    container.removeEventListener('pointermove', this.onPointerMove);
    container.removeEventListener('pointerup', this.onPointerUp);
    container.removeEventListener('pointercancel', this.onPointerUp);
    this.isAttached = false;
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.isPointerDown = true;
    useThreadStore.getState().setIsDrawing(true);

    const point = this.createPointFromEvent(e);
    this.points = [point];
    this.lastScreenX = e.clientX;
    this.lastScreenY = e.clientY;
    this.lastTimestamp = performance.now();

    const mode = useThreadStore.getState().mode;
    globalEventBus.emit('threadStart', { point: [point.x, point.y], mode });
  };

  private createPointFromEvent(e: PointerEvent): ThreadPoint {
    const screenX = e.clientX;
    const screenY = e.clientY;
    const ndcX = (screenX / window.innerWidth) * 2 - 1;
    const ndcY = -(screenY / window.innerHeight) * 2 + 1;

    return {
      x: ndcX * 5,
      y: ndcY * 3,
      z: 0,
      timestamp: performance.now(),
      speed: 0,
      pressure: e.pressure || 0.5,
    };
  }

  private onPointerMove = (e: PointerEvent): void => {
    const now = performance.now();
    const screenX = e.clientX;
    const screenY = e.clientY;

    // Convert to normalized device coordinates [-1, 1]
    const ndcX = (screenX / window.innerWidth) * 2 - 1;
    const ndcY = -(screenY / window.innerHeight) * 2 + 1;
    this.cursorWorldPos = [ndcX * 5, ndcY * 3, 0];

    if (!this.isPointerDown && this.points.length === 0) {
      return;
    }

    // Distance resampling check in screen space (8px threshold)
    const dx = screenX - this.lastScreenX;
    const dy = screenY - this.lastScreenY;
    const dist = Math.hypot(dx, dy);

    if (dist >= ThreadController.RESAMPLE_DIST_PX || this.points.length === 0) {
      const dt = Math.max(1, now - this.lastTimestamp);
      const speed = dist / dt; // px per ms

      const point: ThreadPoint = {
        x: ndcX * 5,
        y: ndcY * 3,
        z: 0,
        timestamp: now,
        speed,
        pressure: e.pressure || 0.5,
      };

      this.addPoint(point);
      this.lastScreenX = screenX;
      this.lastScreenY = screenY;
      this.lastTimestamp = now;

      globalEventBus.emit('threadMove', { point: [point.x, point.y], velocity: speed });
    }
  };

  private onPointerUp = (): void => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    useThreadStore.getState().setIsDrawing(false);

    globalEventBus.emit('threadEnd', { pointsCount: this.points.length });
  };

  public addPoint(point: ThreadPoint): void {
    this.points.push(point);
    if (this.points.length > ThreadController.MAX_POINTS) {
      this.points.shift();
    }
  }

  /**
   * Update and prune old points according to tail lifetime.
   */
  public update(now: number = performance.now()): void {
    const cutoff = now - ThreadController.TAIL_LIFETIME_MS;
    while (this.points.length > 0 && this.points[0].timestamp < cutoff) {
      this.points.shift();
    }
  }

  public getPoints(): readonly ThreadPoint[] {
    return this.points;
  }

  public getCursorPos(): [number, number, number] {
    return this.cursorWorldPos;
  }

  public clear(): void {
    this.points = [];
  }
}

export const globalThreadController = new ThreadController();
