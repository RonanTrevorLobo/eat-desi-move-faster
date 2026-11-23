// The sign-up screen asks for allergies. We remove every recipe whose name/ingredients
// contain a keyword of that allergen. Keyword rules are approximate (see "Limitations").
import { recipeText } from './diet.js';

const ALLERGEN_WORDS = {
  Peanuts: /\b(peanuts?|groundnuts?)\b/,
  'Tree nuts': /\b(almonds?|cashews?|walnuts?|pistachios?|hazelnuts?|pecans?|badam|kaju)\b/,
  Dairy: /\b(milk|curd|dahi|yogh?urt|paneer|ghee|butter|buttermilk|cheese|cream|khoa|khoya|mawa|whey)\b/,
  Gluten: /\b(wheat|atta|maida|flour|semolina|suji|rava|bread|pav|roti|chapati|noodles?|pasta|macaroni|barley|oats)\b/,
  Soy: /\b(soy|soya|tofu)\b/,
  Eggs: /\beggs?\b/,
  Shellfish: /\b(prawns?|shrimps?|crab|lobster)\b/,
};

export function filterForAllergies(recipes, allergies = []) {
  const rules = allergies.map((a) => ALLERGEN_WORDS[a]).filter(Boolean);
  if (rules.length === 0) return recipes;
  return recipes.filter((r) => {
    const text = recipeText(r);
    return !rules.some((rx) => rx.test(text));
  });
}
