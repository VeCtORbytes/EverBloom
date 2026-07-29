export interface Bounds2D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class SpatialHash2D<T> {
  private cellSize: number;
  private grid: Map<string, Set<T>> = new Map();

  constructor(cellSize: number = 1.0) {
    this.cellSize = cellSize;
  }

  private getKey(x: number, y: number): string {
    const gx = Math.floor(x / this.cellSize);
    const gy = Math.floor(y / this.cellSize);
    return `${gx}:${gy}`;
  }

  public insert(item: T, bounds: Bounds2D): void {
    const minGx = Math.floor(bounds.minX / this.cellSize);
    const maxGx = Math.floor(bounds.maxX / this.cellSize);
    const minGy = Math.floor(bounds.minY / this.cellSize);
    const maxGy = Math.floor(bounds.maxY / this.cellSize);

    for (let gx = minGx; gx <= maxGx; gx++) {
      for (let gy = minGy; gy <= maxGy; gy++) {
        const key = `${gx}:${gy}`;
        if (!this.grid.has(key)) {
          this.grid.set(key, new Set());
        }
        this.grid.get(key)!.add(item);
      }
    }
  }

  public queryPoint(x: number, y: number): T[] {
    const key = this.getKey(x, y);
    const set = this.grid.get(key);
    return set ? Array.from(set) : [];
  }

  public clear(): void {
    this.grid.clear();
  }
}
