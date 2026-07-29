import { describe, it, expect, beforeEach } from 'vitest';
import { useGardenStore } from '@/worlds/garden/garden.store';

describe('Garden World Store & Overworld Hub', () => {
  beforeEach(() => {
    useGardenStore.getState().reset();
  });

  it('initializes in courtyard area with school gate unlocked', () => {
    const { activeArea, unlockedGates } = useGardenStore.getState();
    expect(activeArea).toBe('courtyard');
    expect(unlockedGates.has('school_gate')).toBe(true);
  });

  it('updates active area on navigation', () => {
    useGardenStore.getState().setArea('gates');
    expect(useGardenStore.getState().activeArea).toBe('gates');
  });

  it('unlocks new gates and tracks unlocked set', () => {
    useGardenStore.getState().unlockGate('steeping_gate');
    expect(useGardenStore.getState().unlockedGates.has('steeping_gate')).toBe(true);
  });

  it('collects secret mushrooms and records secret ID', () => {
    useGardenStore.getState().collectSecret('mushroom_secret');
    expect(useGardenStore.getState().collectedSecrets.has('mushroom_secret')).toBe(true);
  });
});
