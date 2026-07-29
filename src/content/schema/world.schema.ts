import { z } from 'zod';

export const WorldConfigSchema = z.object({
  id: z.enum([
    'prologue',
    'garden',
    'school',
    'steeping',
    'skybridge',
    'stillwater',
    'ascent',
    'everbloom',
  ]),
  prerequisites: z.array(z.string()),
  softTargetSeconds: z.number().positive(),
  grade: z.string(), // LUT key
  audio: z.object({
    bed: z.string(),
    layers: z.array(z.string()),
    ambience: z.string(),
  }),
  assetBundle: z.string(),
  memories: z.array(z.string()),
  collectibles: z.array(z.string()),
});

export type WorldConfig = z.infer<typeof WorldConfigSchema>;
