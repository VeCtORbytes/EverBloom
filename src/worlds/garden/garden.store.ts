import { create } from 'zustand';
import { globalEventBus } from '@/engine/core/eventBus';

export type GardenArea = 'archway' | 'courtyard' | 'gates';

interface GardenState {
  activeArea: GardenArea;
  unlockedGates: Set<string>;
  collectedSecrets: Set<string>;
  setArea: (area: GardenArea) => void;
  unlockGate: (gateId: string) => void;
  collectSecret: (secretId: string) => void;
  reset: () => void;
}

export const useGardenStore = create<GardenState>((set, get) => ({
  activeArea: 'courtyard',
  unlockedGates: new Set(['school_gate']), // School gate accessible by default
  collectedSecrets: new Set(),

  setArea: (area: GardenArea) => {
    set({ activeArea: area });
  },

  unlockGate: (gateId: string) => {
    const updated = new Set(get().unlockedGates);
    updated.add(gateId);
    set({ unlockedGates: updated });
    globalEventBus.emit('secretFound', { secretId: gateId, worldId: 'garden' });
  },

  collectSecret: (secretId: string) => {
    const updated = new Set(get().collectedSecrets);
    updated.add(secretId);
    set({ collectedSecrets: updated });
    globalEventBus.emit('secretFound', { secretId, worldId: 'garden' });
  },

  reset: () => {
    set({
      activeArea: 'courtyard',
      unlockedGates: new Set(['school_gate']),
      collectedSecrets: new Set(),
    });
  },
}));
