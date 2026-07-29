import { describe, it, expect, beforeEach } from 'vitest';
import { useSceneStore, isValidTransition } from '@/engine/core/sceneMachine';

describe('SceneMachine FSM', () => {
  beforeEach(() => {
    useSceneStore.setState({
      currentScene: 'boot',
      previousScene: null,
      isTransitioning: false,
      transitionError: null,
    });
  });

  it('validates allowed vs disallowed transitions correctly', () => {
    expect(isValidTransition('boot', 'prologue')).toBe(true);
    expect(isValidTransition('boot', 'everbloom')).toBe(false);
    expect(isValidTransition('garden', 'school')).toBe(true);
    expect(isValidTransition('prologue', 'ascent')).toBe(false);
  });

  it('executes valid transitions successfully', async () => {
    const success = await useSceneStore.getState().transitionTo('prologue');
    expect(success).toBe(true);
    expect(useSceneStore.getState().currentScene).toBe('prologue');
    expect(useSceneStore.getState().previousScene).toBe('boot');
  });

  it('rejects invalid transitions unless force flag is set', async () => {
    const success = await useSceneStore.getState().transitionTo('everbloom');
    expect(success).toBe(false);
    expect(useSceneStore.getState().currentScene).toBe('boot');

    const forcedSuccess = await useSceneStore.getState().transitionTo('everbloom', { force: true });
    expect(forcedSuccess).toBe(true);
    expect(useSceneStore.getState().currentScene).toBe('everbloom');
  });
});
