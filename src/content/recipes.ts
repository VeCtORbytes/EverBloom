import { Recipe, Ingredient } from './schema/recipe.schema';

export const INGREDIENTS: Ingredient[] = [
  { id: 'spark_dust', name: 'Spark Dust', joke: 'Made from leftover optimism.', sprite: 'spark_dust.png' },
  { id: 'moon_dew', name: 'Moon Dew', joke: 'Collected at 3 AM when you should be sleeping.', sprite: 'moon_dew.png' },
  { id: 'dragon_scale', name: 'Dragon Scale', joke: 'Surprisingly flaky.', sprite: 'dragon_scale.png' },
  { id: 'sun_petal', name: 'Sun Petal', joke: 'Smells like summer holidays.', sprite: 'sun_petal.png' },
];

export const RECIPES: Recipe[] = [
  {
    id: 'elixir_of_giggles',
    name: 'Elixir of Giggles',
    ingredients: ['spark_dust', 'moon_dew'],
    riddleText: 'Combine two parts of what she says when she is lying.',
    resultLine: 'The cauldron bubbles violently and burps a cloud of pink smoke!',
    vfx: 'vfx_giggle_burst',
  },
  {
    id: 'potion_of_focus',
    name: 'Potion of Focus',
    ingredients: ['dragon_scale', 'sun_petal'],
    riddleText: 'One part dragon grit, one part morning warmth.',
    resultLine: 'A soothing golden steam rises in neat geometric swirls.',
    vfx: 'vfx_golden_swirl',
  },
];
