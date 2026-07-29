import { SigilId } from '@/types/ids';
import { SpatialHash2D } from './spatialHash';
import { globalEventBus } from '@/engine/core/eventBus';

export interface InteractableItem {
  id: string;
  position: [number, number, number];
  radius?: number; // Hit radius in world units (default 0.6)
  requiredSigil?: SigilId;
  cursorState?: 'hover' | 'active' | 'denied';
  tabIndex?: number;
  onThread?: () => void;
  onSigil?: (sigilId: SigilId) => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export class InteractionRegistry {
  private items: Map<string, InteractableItem> = new Map();
  private spatialHash: SpatialHash2D<string> = new SpatialHash2D(1.5);
  private hoveredId: string | null = null;
  private focusedIndex: number = -1;
  private isKeyboardNavActive: boolean = false;

  public register(item: InteractableItem): void {
    this.items.set(item.id, item);
    this.rebuildSpatialHash();
  }

  public unregister(id: string): void {
    if (this.hoveredId === id) {
      this.items.get(id)?.onHoverEnd?.();
      this.hoveredId = null;
    }
    this.items.delete(id);
    this.rebuildSpatialHash();
  }

  public get(id: string): InteractableItem | undefined {
    return this.items.get(id);
  }

  public getAllSorted(): InteractableItem[] {
    return Array.from(this.items.values()).sort((a, b) => {
      const idxA = a.tabIndex ?? 0;
      const idxB = b.tabIndex ?? 0;
      if (idxA !== idxB) return idxA - idxB;
      return a.id.localeCompare(b.id);
    });
  }

  public getHoveredId(): string | null {
    return this.hoveredId;
  }

  public getFocusedItem(): InteractableItem | null {
    const sorted = this.getAllSorted();
    if (this.focusedIndex >= 0 && this.focusedIndex < sorted.length) {
      return sorted[this.focusedIndex];
    }
    return null;
  }

  public updateHover(worldX: number, worldY: number): string | null {
    const candidates = this.spatialHash.queryPoint(worldX, worldY);
    let closestId: string | null = null;
    let minSqDist = Infinity;

    for (const id of candidates) {
      const item = this.items.get(id);
      if (!item) continue;

      const radius = item.radius ?? 0.6;
      const dx = worldX - item.position[0];
      const dy = worldY - item.position[1];
      const sqDist = dx * dx + dy * dy;

      if (sqDist <= radius * radius && sqDist < minSqDist) {
        minSqDist = sqDist;
        closestId = id;
      }
    }

    if (closestId !== this.hoveredId) {
      if (this.hoveredId) {
        this.items.get(this.hoveredId)?.onHoverEnd?.();
      }
      if (closestId) {
        this.items.get(closestId)?.onHoverStart?.();
      }
      this.hoveredId = closestId;
    }

    return this.hoveredId;
  }

  public activate(id: string): void {
    const item = this.items.get(id);
    if (!item) return;

    item.onThread?.();
    globalEventBus.emit('interactableActivated', { id });
  }

  public activateFocused(): void {
    const item = this.getFocusedItem();
    if (item) {
      this.activate(item.id);
    }
  }

  public cycleKeyboardFocus(reverse: boolean = false): InteractableItem | null {
    const sorted = this.getAllSorted();
    if (sorted.length === 0) return null;

    this.isKeyboardNavActive = true;
    if (reverse) {
      this.focusedIndex = (this.focusedIndex - 1 + sorted.length) % sorted.length;
    } else {
      this.focusedIndex = (this.focusedIndex + 1) % sorted.length;
    }

    return sorted[this.focusedIndex];
  }

  public clearKeyboardFocus(): void {
    this.focusedIndex = -1;
    this.isKeyboardNavActive = false;
  }

  public isKeyboardActive(): boolean {
    return this.isKeyboardNavActive;
  }

  public clear(): void {
    this.items.clear();
    this.spatialHash.clear();
    this.hoveredId = null;
    this.focusedIndex = -1;
  }

  private rebuildSpatialHash(): void {
    this.spatialHash.clear();
    for (const item of this.items.values()) {
      const radius = item.radius ?? 0.6;
      const bounds = {
        minX: item.position[0] - radius,
        maxX: item.position[0] + radius,
        minY: item.position[1] - radius,
        maxY: item.position[1] + radius,
      };
      this.spatialHash.insert(item.id, bounds);
    }
  }
}

export const globalInteractionRegistry = new InteractionRegistry();
