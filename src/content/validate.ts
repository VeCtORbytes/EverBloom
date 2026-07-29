import { MemoryNodeSchema } from './schema/memory.schema';
import { RecipeSchema, IngredientSchema } from './schema/recipe.schema';
import { WorldConfigSchema } from './schema/world.schema';
import { MEMORIES } from './memories';
import { RECIPES, INGREDIENTS } from './recipes';
import { WORLDS_CONFIG } from './worlds.config';

export interface ValidationReport {
  success: boolean;
  errors: string[];
}

export function validateAllContent(): ValidationReport {
  const errors: string[] = [];

  // 1. Validate Memory Nodes
  MEMORIES.forEach((memory, idx) => {
    const parseResult = MemoryNodeSchema.safeParse(memory);
    if (!parseResult.success) {
      errors.push(`Memory[${idx}] "${memory.id || 'unknown'}": ${parseResult.error.message}`);
    }
  });

  // 2. Validate Ingredients & Recipes
  INGREDIENTS.forEach((ing, idx) => {
    const res = IngredientSchema.safeParse(ing);
    if (!res.success) {
      errors.push(`Ingredient[${idx}] "${ing.id}": ${res.error.message}`);
    }
  });

  const ingredientIds = new Set(INGREDIENTS.map((i) => i.id));
  RECIPES.forEach((recipe, idx) => {
    const res = RecipeSchema.safeParse(recipe);
    if (!res.success) {
      errors.push(`Recipe[${idx}] "${recipe.id}": ${res.error.message}`);
    }

    // Referential integrity check: recipe ingredients exist
    recipe.ingredients.forEach((ingId) => {
      if (!ingredientIds.has(ingId)) {
        errors.push(`Recipe "${recipe.id}" references non-existent ingredient "${ingId}".`);
      }
    });
  });

  // 3. Validate World Configs
  const allMemoryIds = new Set(MEMORIES.map((m) => m.id));
  Object.values(WORLDS_CONFIG).forEach((world) => {
    const res = WorldConfigSchema.safeParse(world);
    if (!res.success) {
      errors.push(`WorldConfig "${world.id}": ${res.error.message}`);
    }

    // Referential integrity check: world memories exist in memories.ts
    world.memories.forEach((memId) => {
      if (!allMemoryIds.has(memId)) {
        errors.push(`WorldConfig "${world.id}" references non-existent memoryId "${memId}".`);
      }
    });
  });

  return {
    success: errors.length === 0,
    errors,
  };
}
