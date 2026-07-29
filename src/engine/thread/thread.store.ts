import { create } from 'zustand';

export type ThreadMode = 'free' | 'gesture' | 'drag' | 'tether' | 'link';

export interface ThreadPoint {
  x: number; // Normalized screen coords [-1, 1] or WebGL world space
  y: number;
  z: number;
  timestamp: number;
  speed: number;
  pressure: number;
}

interface ThreadStoreState {
  mode: ThreadMode;
  color: string; // Hex or CSS color string (e.g. '#f59e0b')
  isDrawing: boolean;
  setMode: (mode: ThreadMode) => void;
  setColor: (color: string) => void;
  setIsDrawing: (isDrawing: boolean) => void;
}

export const useThreadStore = create<ThreadStoreState>((set) => ({
  mode: 'free',
  color: '#f59e0b', // Default amber
  isDrawing: false,
  setMode: (mode: ThreadMode) => set({ mode }),
  setColor: (color: string) => set({ color }),
  setIsDrawing: (isDrawing: boolean) => set({ isDrawing }),
}));
