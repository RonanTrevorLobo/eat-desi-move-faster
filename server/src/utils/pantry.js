// "Which of this recipe's ingredients does the user already have?"
// Same logic as client/src/data.ts (matchInfo) so the chat and the cards agree.
const ALIAS = {
  atta: ['whole wheat flour'], palak: ['spinach'], dahi: ['curd', 'hung curd'], besan: ['gram flour'], eggs: ['egg'], egg: ['eggs'],
  'toor dal': ['toor dal'], 'chana dal': ['chickpeas'], 'green chilli': ['chilli'], 'fish fillets': ['fish'], 'chicken breast': ['chicken'], oats: ['oat'],
};
const STAPLE = /^(oil|coconut oil|olive oil|mustard oil|salt|water)$/i; // never counted as "missing"

export function has(pantry, ingredientName) {
  const n = ingredientName.toLowerCase();
  return pantry.some((raw) => {
    const p = raw.toLowerCase().trim();
    return Boolean(p) && [p, ...(ALIAS[p] || [])].some((x) => n.includes(x) || (x.length > 3 && x.includes(n)));
  });
}

export function matchInfo(recipe, pantry) {
  const names = recipe.ingredients.map((i) => i.name).filter((n) => !STAPLE.test(n));
  const have = names.filter((n) => has(pantry, n));
  return { have, missing: names.filter((n) => !have.includes(n)), total: names.length };
}
