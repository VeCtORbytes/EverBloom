import { describe, it, expect } from 'vitest';
import { validateAllContent } from '@/content/validate';
import { MemoryNodeSchema } from '@/content/schema/memory.schema';
import { AssetLoader } from '@/engine/loader/AssetLoader';

describe('Content Validation & Asset Loader', () => {
  it('validates all authored memories, recipes, and worlds with zero errors', () => {
    const report = validateAllContent();
    expect(report.success).toBe(true);
    expect(report.errors.length).toBe(0);
  });

  it('validates MemoryNodeSchema happy and sad paths', () => {
    const validMemory = {
      id: 'test_memory_01',
      type: 'image',
      title: 'Valid Memory',
      content: 'http://example.com/test.png',
      worldId: 'school',
      year: 2021,
    };
    expect(MemoryNodeSchema.safeParse(validMemory).success).toBe(true);

    const invalidMemory = {
      id: '',
      type: 'unknown_type',
      title: '',
      content: '',
      worldId: 'invalid_world',
      year: 1800,
    };
    expect(MemoryNodeSchema.safeParse(invalidMemory).success).toBe(false);
  });

  it('calculates asset loader tier progress correctly', async () => {
    const loader = new AssetLoader();
    expect(loader.getProgress()).toBe(0);

    await loader.loadTier('boot');
    expect(loader.getProgress()).toBeGreaterThan(0);
  });
});
