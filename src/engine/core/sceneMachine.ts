import { create } from 'zustand';
import { WorldId } from '@/types/ids';
import { globalEventBus } from './eventBus';

export type SceneState = WorldId | 'boot';

export interface SceneTransitionOptions {
  force?: boolean;
  meta?: Record<string, unknown>;
}

export type SceneGuard = (
  from: SceneState,
  to: SceneState
) => boolean | Promise<boolean>;

const VALID_TRANSITIONS: Record<SceneState, SceneState[]> = {
  boot: ['prologue', 'garden'],
  prologue: ['garden'],
  garden: ['school', 'steeping', 'skybridge', 'stillwater', 'ascent', 'freeroam'],
  school: ['garden', 'ascent'],
  steeping: ['garden', 'ascent'],
  skybridge: ['garden', 'ascent'],
  stillwater: ['garden', 'ascent'],
  ascent: ['everbloom'],
  everbloom: ['credits'],
  credits: ['freeroam', 'garden'],
  freeroam: ['garden', 'school', 'steeping', 'skybridge', 'stillwater'],
};

interface SceneMachineStoreState {
  currentScene: SceneState;
  previousScene: SceneState | null;
  isTransitioning: boolean;
  transitionError: string | null;
  transitionTo: (to: SceneState, options?: SceneTransitionOptions) => Promise<boolean>;
}

const guards: Set<SceneGuard> = new Set();

export const useSceneStore = create<SceneMachineStoreState>((set, get) => ({
  currentScene: 'boot',
  previousScene: null,
  isTransitioning: false,
  transitionError: null,

  transitionTo: async (to: SceneState, options?: SceneTransitionOptions): Promise<boolean> => {
    const { currentScene, isTransitioning } = get();

    if (currentScene === to) {
      return true;
    }

    if (isTransitioning && !options?.force) {
      console.warn(`[SceneMachine] Transition to "${to}" ignored: already transitioning from "${currentScene}".`);
      return false;
    }

    // Validate transition unless forced (e.g. dev SceneJumper)
    const allowed = VALID_TRANSITIONS[currentScene]?.includes(to);
    if (!allowed && !options?.force) {
      const msg = `[SceneMachine] Invalid transition from "${currentScene}" to "${to}". Allowed: ${
        VALID_TRANSITIONS[currentScene]?.join(', ') || 'none'
      }`;
      console.error(msg);
      set({ transitionError: msg });
      return false;
    }

    // Execute registered transition guards
    for (const guard of guards) {
      try {
        const canPass = await guard(currentScene, to);
        if (!canPass && !options?.force) {
          console.warn(`[SceneMachine] Transition from "${currentScene}" to "${to}" blocked by guard.`);
          return false;
        }
      } catch (err) {
        console.error(`[SceneMachine] Guard error during transition:`, err);
        if (!options?.force) return false;
      }
    }

    set({ isTransitioning: true, transitionError: null });
    globalEventBus.emit('transitionStarted', { from: currentScene, to });

    try {
      // Transition update
      set({
        currentScene: to,
        previousScene: currentScene,
        isTransitioning: false,
      });

      globalEventBus.emit('transitionFinished', { from: currentScene, to });
      if (to !== 'boot') {
        globalEventBus.emit('worldEntered', { worldId: to });
      }
      return true;
    } catch (err) {
      console.error(`[SceneMachine] Error during transition execution:`, err);
      set({
        isTransitioning: false,
        transitionError: String(err),
      });
      return false;
    }
  },
}));

export function registerSceneGuard(guard: SceneGuard): () => void {
  guards.add(guard);
  return () => guards.delete(guard);
}

export function isValidTransition(from: SceneState, to: SceneState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
