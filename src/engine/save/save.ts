import { ProgressState, Settings, SettingsSchema } from './schema';
import { migrateProgressState, createDefaultProgressState } from './migrations';
import { globalEventBus } from '@/engine/core/eventBus';
import { SigilId, LanternId } from '@/types/ids';

export const SAVE_KEY = 'everbloom.save.v1';
export const SETTINGS_KEY = 'everbloom.settings.v1';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

const memoryFallbackStorage = new MemoryStorage();

function getStorage(): Storage {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      return window.localStorage;
    }
  } catch {
    // Ignore error
  }
  return memoryFallbackStorage;
}

export class SaveManager {
  private currentState: ProgressState;
  private currentSettings: Settings;
  private isAutosaveAttached: boolean = false;

  constructor() {
    this.currentState = this.loadSave();
    this.currentSettings = this.loadSettings();
  }

  public getSave(): ProgressState {
    return this.currentState;
  }

  public getSettings(): Settings {
    return this.currentSettings;
  }

  public loadSave(): ProgressState {
    try {
      const storage = getStorage();
      const raw = storage.getItem(SAVE_KEY);
      if (!raw) return createDefaultProgressState();
      const parsed = JSON.parse(raw);
      return migrateProgressState(parsed);
    } catch (e) {
      console.warn('[SaveManager] Corrupt save payload encountered. Recovering to fresh start state.', e);
      return createDefaultProgressState();
    }
  }

  public writeSave(update: Partial<ProgressState>): ProgressState {
    this.currentState = {
      ...this.currentState,
      ...update,
      lastPlayedISO: new Date().toISOString(),
    };

    try {
      const storage = getStorage();
      storage.setItem(SAVE_KEY, JSON.stringify(this.currentState));
      globalEventBus.emit('saveWritten', { timestamp: this.currentState.lastPlayedISO });
    } catch (e) {
      console.error('[SaveManager] Failed to write save to storage:', e);
    }

    return this.currentState;
  }

  public resetSave(): ProgressState {
    this.currentState = createDefaultProgressState();
    try {
      const storage = getStorage();
      storage.removeItem(SAVE_KEY);
    } catch (e) {
      console.error('[SaveManager] Failed to clear save from storage:', e);
    }
    return this.currentState;
  }

  public loadSettings(): Settings {
    const defaults: Settings = {
      version: 1,
      reducedMotion: false,
      holdToCast: false,
      captions: true,
      reduceFlashing: false,
      quality: 'auto',
      volumes: { master: 1.0, music: 0.8, ambience: 0.7, sfx: 0.9, voice: 1.0 },
    };

    try {
      const storage = getStorage();
      const raw = storage.getItem(SETTINGS_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      const res = SettingsSchema.safeParse(parsed);
      return res.success ? res.data : defaults;
    } catch (e) {
      console.warn('[SaveManager] Unable to load settings, using defaults.', e);
      return defaults;
    }
  }

  public writeSettings(update: Partial<Settings>): Settings {
    this.currentSettings = {
      ...this.currentSettings,
      ...update,
      volumes: update.volumes ? { ...this.currentSettings.volumes, ...update.volumes } : this.currentSettings.volumes,
    };

    try {
      const storage = getStorage();
      storage.setItem(SETTINGS_KEY, JSON.stringify(this.currentSettings));
    } catch (e) {
      console.error('[SaveManager] Failed to write settings to storage:', e);
    }

    return this.currentSettings;
  }

  public attachAutosaveListeners(): void {
    if (this.isAutosaveAttached) return;

    globalEventBus.on('worldEntered', ({ worldId }) => {
      this.writeSave({ currentScene: worldId });
    });

    globalEventBus.on('worldCompleted', ({ worldId }) => {
      const completed = new Set(this.currentState.worldsCompleted);
      completed.add(worldId);
      this.writeSave({ worldsCompleted: Array.from(completed) });
    });

    globalEventBus.on('memoryCollected', ({ memoryId }) => {
      const memories = new Set(this.currentState.memories);
      memories.add(memoryId);
      this.writeSave({ memories: Array.from(memories) });
    });

    globalEventBus.on('secretFound', ({ secretId }) => {
      const secrets = new Set(this.currentState.secrets);
      secrets.add(secretId);
      this.writeSave({ secrets: Array.from(secrets) });
    });

    globalEventBus.on('sigilAcquired', ({ sigilId }) => {
      const sigils = new Set(this.currentState.sigils);
      sigils.add(sigilId as SigilId);
      this.writeSave({ sigils: Array.from(sigils) as SigilId[] });
    });

    globalEventBus.on('lanternChosen', ({ lanternId }) => {
      this.writeSave({ lantern: lanternId as LanternId });
    });

    this.isAutosaveAttached = true;
  }
}

export const globalSaveManager = new SaveManager();
