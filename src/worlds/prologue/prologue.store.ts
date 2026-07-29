import { create } from 'zustand';
import { LanternId } from '@/types/ids';
import { globalEventBus } from '@/engine/core/eventBus';

export type PrologueStep = 'darkness' | 'first_thread' | 'seed_awakened' | 'lantern_chosen';

interface PrologueState {
  step: PrologueStep;
  chosenLantern: LanternId | null;
  igniteEmber: () => void;
  awakenSeed: () => void;
  chooseLantern: (lantern: LanternId) => void;
  reset: () => void;
}

export const usePrologueStore = create<PrologueState>((set, get) => ({
  step: 'darkness',
  chosenLantern: null,

  igniteEmber: () => {
    if (get().step === 'darkness') {
      set({ step: 'first_thread' });
      globalEventBus.emit('interactableActivated', { id: 'ember_core' });
    }
  },

  awakenSeed: () => {
    if (get().step === 'first_thread' || get().step === 'darkness') {
      set({ step: 'seed_awakened' });
      globalEventBus.emit('secretFound', { secretId: 'seed_awakened', worldId: 'prologue' });
    }
  },

  chooseLantern: (lantern: LanternId) => {
    set({ step: 'lantern_chosen', chosenLantern: lantern });
    globalEventBus.emit('lanternChosen', { lanternId: lantern });
    globalEventBus.emit('sigilAcquired', { sigilId: 'kindle' });
    globalEventBus.emit('worldCompleted', { worldId: 'prologue' });
  },

  reset: () => {
    set({ step: 'darkness', chosenLantern: null });
  },
}));
