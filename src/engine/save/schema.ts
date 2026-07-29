import { z } from 'zod';

export const ProgressStateSchema = z.object({
  version: z.literal(1),
  contentVersion: z.string().default('1.0.0'),
  lantern: z.enum(['amber', 'rose', 'jade', 'violet']).nullable().default(null),
  sigils: z.array(z.enum(['kindle', 'unbind', 'beckon', 'echo'])).default(['kindle']),
  worldsCompleted: z.array(z.string()).default([]),
  memories: z.array(z.string()).default([]),
  secrets: z.array(z.string()).default([]),
  bouquet: z
    .array(
      z.object({
        memoryId: z.string(),
        position: z.tuple([z.number(), z.number()]),
      })
    )
    .default([]),
  constellationLinks: z.array(z.tuple([z.string(), z.string()])).default([]),
  currentScene: z.string().default('prologue'),
  playthroughs: z.number().int().min(0).default(0),
  totalSeconds: z.number().min(0).default(0),
  lastPlayedISO: z.string().default(() => new Date().toISOString()),
});

export const SettingsSchema = z.object({
  version: z.literal(1),
  reducedMotion: z.boolean().default(false),
  holdToCast: z.boolean().default(false),
  captions: z.boolean().default(true),
  reduceFlashing: z.boolean().default(false),
  quality: z.enum(['auto', 'low', 'medium', 'high']).default('auto'),
  volumes: z.object({
    master: z.number().min(0).max(1).default(1.0),
    music: z.number().min(0).max(1).default(0.8),
    ambience: z.number().min(0).max(1).default(0.7),
    sfx: z.number().min(0).max(1).default(0.9),
    voice: z.number().min(0).max(1).default(1.0),
  }),
});

export type ProgressState = z.infer<typeof ProgressStateSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
