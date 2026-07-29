import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpatialHash2D } from '@/engine/interaction/spatialHash';
import { InteractionRegistry } from '@/engine/interaction/InteractionRegistry';

describe('SpatialHash2D & InteractionRegistry', () => {
  let registry: InteractionRegistry;

  beforeEach(() => {
    registry = new InteractionRegistry();
  });

  it('inserts and queries points correctly in SpatialHash2D', () => {
    const hash = new SpatialHash2D<string>(1.0);
    hash.insert('obj-1', { minX: 0, maxX: 1, minY: 0, maxY: 1 });

    const results = hash.queryPoint(0.5, 0.5);
    expect(results).toContain('obj-1');

    const emptyResults = hash.queryPoint(10, 10);
    expect(emptyResults.length).toBe(0);
  });

  it('registers and unregisters interactable items with clean lifecycle', () => {
    const hoverStartSpy = vi.fn();
    const hoverEndSpy = vi.fn();

    registry.register({
      id: 'lantern-1',
      position: [0, 0, 0],
      radius: 1.0,
      onHoverStart: hoverStartSpy,
      onHoverEnd: hoverEndSpy,
    });

    expect(registry.get('lantern-1')).toBeDefined();

    // Hover over lantern-1
    registry.updateHover(0.2, 0.2);
    expect(registry.getHoveredId()).toBe('lantern-1');
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);

    // Unregister lantern-1 -> hoverEnd should fire
    registry.unregister('lantern-1');
    expect(registry.get('lantern-1')).toBeUndefined();
    expect(registry.getHoveredId()).toBeNull();
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
  });

  it('sorts Tab focus order deterministically by tabIndex and ID', () => {
    registry.register({ id: 'item-c', position: [0, 0, 0], tabIndex: 2 });
    registry.register({ id: 'item-a', position: [0, 0, 0], tabIndex: 1 });
    registry.register({ id: 'item-b', position: [0, 0, 0], tabIndex: 1 });

    const sorted = registry.getAllSorted();
    expect(sorted.map((i) => i.id)).toEqual(['item-a', 'item-b', 'item-c']);

    // Cycle focus
    const focused1 = registry.cycleKeyboardFocus();
    expect(focused1?.id).toBe('item-a');

    const focused2 = registry.cycleKeyboardFocus();
    expect(focused2?.id).toBe('item-b');
  });
});
