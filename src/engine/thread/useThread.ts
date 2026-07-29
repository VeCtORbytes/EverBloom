import { useEffect } from 'react';
import { useThreadStore, ThreadMode } from './thread.store';
import { globalThreadController } from './ThreadController';

export function useThread() {
  const mode = useThreadStore((state) => state.mode);
  const color = useThreadStore((state) => state.color);
  const isDrawing = useThreadStore((state) => state.isDrawing);
  const setMode = useThreadStore((state) => state.setMode);
  const setColor = useThreadStore((state) => state.setColor);

  useEffect(() => {
    globalThreadController.attach();
    return () => globalThreadController.detach();
  }, []);

  return {
    mode,
    color,
    isDrawing,
    setMode: (newMode: ThreadMode) => setMode(newMode),
    setColor: (newColor: string) => setColor(newColor),
    clearThread: () => globalThreadController.clear(),
  };
}
