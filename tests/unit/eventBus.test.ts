import { describe, it, expect, vi } from 'vitest';
import { TypedEventBus } from '@/engine/core/eventBus';

describe('TypedEventBus', () => {
  it('emits events to subscribed listeners with correct payload', () => {
    const bus = new TypedEventBus();
    const listener = vi.fn();

    bus.on('worldEntered', listener);
    bus.emit('worldEntered', { worldId: 'garden' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ worldId: 'garden' });
  });

  it('unsubscribes listeners via returned cleanup function', () => {
    const bus = new TypedEventBus();
    const listener = vi.fn();

    const unsubscribe = bus.on('sigilCast', listener);
    bus.emit('sigilCast', { sigilId: 'kindle', score: 0.9 });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    bus.emit('sigilCast', { sigilId: 'kindle', score: 0.95 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('handles errors gracefully in listeners without breaking other listeners', () => {
    const bus = new TypedEventBus();
    const badListener = vi.fn(() => {
      throw new Error('Failing listener');
    });
    const goodListener = vi.fn();

    bus.on('saveWritten', badListener);
    bus.on('saveWritten', goodListener);

    expect(() => {
      bus.emit('saveWritten', { timestamp: '2026-07-29T12:00:00Z' });
    }).not.toThrow();

    expect(badListener).toHaveBeenCalled();
    expect(goodListener).toHaveBeenCalled();
  });
});
