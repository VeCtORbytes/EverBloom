import { z } from 'zod';

export const MemoryTypeSchema = z.enum(['image', 'video', 'audio', 'letter']);

export const MemoryNodeSchema = z.object({
  id: z.string().min(1),
  type: MemoryTypeSchema,
  title: z.string().min(1),
  content: z.string().min(1), // Text content, media URL, or letter body
  worldId: z.enum([
    'prologue',
    'garden',
    'school',
    'steeping',
    'skybridge',
    'stillwater',
    'ascent',
    'everbloom',
  ]),
  year: z.number().int().min(2000).max(2100),
  thumbnail: z.string().optional(),
  isSecret: z.boolean().default(false),
  position: z.tuple([z.number(), z.number()]).optional(), // Stillwater arrangement coords [x, y]
});

export type MemoryNode = z.infer<typeof MemoryNodeSchema>;
