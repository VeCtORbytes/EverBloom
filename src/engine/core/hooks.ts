import { useEffect } from 'react';
import { useSceneStore, SceneState, SceneTransitionOptions } from './sceneMachine';
import { globalEventBus, EngineEventKey, EngineEventMap } from './eventBus';

export function useScene() {
  const currentScene = useSceneStore((state) => state.currentScene);
  const previousScene = useSceneStore((state) => state.previousScene);
  const isTransitioning = useSceneStore((state) => state.isTransitioning);
  const transitionError = useSceneStore((state) => state.transitionError);
  const transitionTo = useSceneStore((state) => state.transitionTo);

  return {
    currentScene,
    previousScene,
    isTransitioning,
    transitionError,
    transitionTo: (to: SceneState, options?: SceneTransitionOptions) =>
      transitionTo(to, options),
  };
}

export function useEvent<K extends EngineEventKey>(
  event: K,
  callback: (payload: EngineEventMap[K]) => void
): void {
  useEffect(() => {
    return globalEventBus.on(event, callback);
  }, [event, callback]);
}
