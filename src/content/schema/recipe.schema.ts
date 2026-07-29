import { z } from 'zod';

export const IngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  joke: z.string().min(1),
  sprite: z.string(),
});

export const RecipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ingredients: z.array(z.string()).length(2),
  riddleText: z.string().min(1),
  resultLine: z.string().min(1),
  vfx: z.string(),
});

export const ReactionSchema = z.object({
  a: z.string().min(1),
  b: z.string().min(1),
  resultName: z.string().min(1),
  line: z.string().min(1),
  vfx: z.string(),
  isRecipeStep: z.boolean().default(false),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type Reaction = z.infer<typeof ReactionSchema>;
