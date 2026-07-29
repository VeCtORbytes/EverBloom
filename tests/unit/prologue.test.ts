import { describe, it, expect, beforeEach } from 'vitest';
import { usePrologueStore } from '@/worlds/prologue/prologue.store';

describe('Prologue World Store & FSM', () => {
  beforeEach(() => {
    usePrologueStore.getState().reset();
  });

  it('starts in darkness step', () => {
    const { step, chosenLantern } = usePrologueStore.getState();
    expect(step).toBe('darkness');
    expect(chosenLantern).toBeNull();
  });

  it('ignites ember on first thread interaction', () => {
    usePrologueStore.getState().igniteEmber();
    expect(usePrologueStore.getState().step).toBe('first_thread');
  });

  it('awakens sprout seed and discloses lantern pedestals', () => {
    usePrologueStore.getState().igniteEmber();
    usePrologueStore.getState().awakenSeed();
    expect(usePrologueStore.getState().step).toBe('seed_awakened');
  });

  it('chooses lantern, unlocks Kindle sigil, and completes prologue', () => {
    usePrologueStore.getState().awakenSeed();
    usePrologueStore.getState().chooseLantern('rose');

    const state = usePrologueStore.getState();
    expect(state.step).toBe('lantern_chosen');
    expect(state.chosenLantern).toBe('rose');
  });
});
