import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '@/engine/save/save';
import { migrateProgressState } from '@/engine/save/migrations';

describe('Save Manager, Migrations & Settings', () => {
  let saveManager: SaveManager;

  beforeEach(() => {
    saveManager = new SaveManager();
    saveManager.resetSave();
  });

  it('creates clean initial progress state', () => {
    const save = saveManager.getSave();
    expect(save.version).toBe(1);
    expect(save.sigils).toEqual(['kindle']);
    expect(save.memories).toEqual([]);
  });

  it('writes and reads save updates successfully', () => {
    saveManager.writeSave({ memories: ['memory_1', 'memory_2'], currentScene: 'garden' });
    const loaded = saveManager.loadSave();

    expect(loaded.memories).toEqual(['memory_1', 'memory_2']);
    expect(loaded.currentScene).toBe('garden');
  });

  it('recovers silently from corrupt save payload without throwing errors', () => {
    // Test corrupt state object
    const corruptState = { version: 'invalid_version_type' };
    const recovered = migrateProgressState(corruptState);

    expect(recovered.version).toBe(1);
    expect(recovered.sigils).toEqual(['kindle']);
  });

  it('migrates raw state objects through migration pipeline', () => {
    const rawV1State = { version: 1, currentScene: 'school', memories: ['m1'] };
    const migrated = migrateProgressState(rawV1State);

    expect(migrated.version).toBe(1);
    expect(migrated.currentScene).toBe('school');
    expect(migrated.memories).toEqual(['m1']);
  });

  it('preserves settings independently when resetting progress', () => {
    saveManager.writeSettings({ reducedMotion: true, holdToCast: true });
    saveManager.resetSave();

    const settings = saveManager.getSettings();
    expect(settings.reducedMotion).toBe(true);
    expect(settings.holdToCast).toBe(true);

    const save = saveManager.getSave();
    expect(save.memories).toEqual([]);
  });
});
