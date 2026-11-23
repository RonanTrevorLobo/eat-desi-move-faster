// Which diet types may a user with a given diet eat?
// Example: an Eggetarian can eat Eggetarian + Vegetarian + Vegan + Jain dishes.
const ALLOWED = {
  Vegan: ['Vegan'],
  Vegetarian: ['Vegetarian', 'Vegan', 'Jain'],
  Jain: ['Jain', 'Vegetarian', 'Vegan'],
  Eggetarian: ['Eggetarian', 'Vegetarian', 'Vegan', 'Jain'],
  'Non-Veg': ['Non-Veg', 'Eggetarian', 'Vegetarian', 'Vegan', 'Jain'],
};

export function allowedDietTypes(dietType) {
  return ALLOWED[dietType] || ALLOWED.Vegetarian;
}

// "name + all ingredient names" as one lowercase string (ingredients can be {name} objects or plain strings)
export function recipeText(r) {
  const names = (r.ingredients || []).map((i) => (typeof i === 'string' ? i : i.name));
  return `${r.name} ${names.join(' ')}`.toLowerCase();
}

// Jain food avoids onion, garlic and root vegetables.
const JAIN_AVOID = /\b(onion|garlic|potato|aloo|carrot|radish|turnip|beetroot|ginger|mushroom|yam|arbi)\b/;

export function filterForDiet(recipes, dietType) {
  if (dietType !== 'Jain') return recipes;
  return recipes.filter((r) => !JAIN_AVOID.test(recipeText(r)));
}
