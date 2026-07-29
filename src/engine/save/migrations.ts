import { ProgressState, ProgressStateSchema } from './schema';

export function migrateProgressState(rawState: unknown): ProgressState {
  if (typeof rawState !== 'object' || rawState === null) {
    return createDefaultProgressState();
  }

  const stateObj = rawState as Record<string, unknown>;
  const version = stateObj.version;

  // v1 migration (current baseline)
  if (version === 1) {
    const parseResult = ProgressStateSchema.safeParse(stateObj);
    if (parseResult.success) {
      return parseResult.data;
    }
  }

  // Future migration hooks (e.g. version 2 -> upgrade fields)

  // Fallback: If parse fails or version unknown, return safe default state
  console.warn('[SaveMigration] Unable to parse or migrate save state. Falling back to fresh start state.');
  return createDefaultProgressState();
}

export function createDefaultProgressState(): ProgressState {
  return {
    version: 1,
    contentVersion: '1.0.0',
    lantern: null,
    sigils: ['kindle'],
    worldsCompleted: [],
    memories: [],
    secrets: [],
    bouquet: [],
    constellationLinks: [],
    currentScene: 'prologue',
    playthroughs: 0,
    totalSeconds: 0,
    lastPlayedISO: new Date().toISOString(),
  };
}
