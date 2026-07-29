import { useState, useCallback, useEffect } from 'react';
import { ProgressState } from './schema';
import { globalSaveManager } from './save';
import { globalEventBus } from '@/engine/core/eventBus';

export function useSave() {
  const [saveState, setSaveState] = useState<ProgressState>(globalSaveManager.getSave());

  useEffect(() => {
    globalSaveManager.attachAutosaveListeners();

    const unsubSave = globalEventBus.on('saveWritten', () => {
      setSaveState({ ...globalSaveManager.getSave() });
    });

    return () => unsubSave();
  }, []);

  const writeSave = useCallback((update: Partial<ProgressState>) => {
    const updated = globalSaveManager.writeSave(update);
    setSaveState({ ...updated });
  }, []);

  const resetSave = useCallback(() => {
    const fresh = globalSaveManager.resetSave();
    setSaveState({ ...fresh });
  }, []);

  return {
    saveState,
    writeSave,
    resetSave,
    memories: saveState.memories,
    sigils: saveState.sigils,
    secrets: saveState.secrets,
  };
}
