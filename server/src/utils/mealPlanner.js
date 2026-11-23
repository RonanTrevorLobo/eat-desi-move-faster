// Builds a daily / weekly meal plan from a list of recipes.
// It is a plain function (no database inside), so it is easy to test.
//
// Idea:
//   1. Split the day's calories between 4 meals (breakfast 25%, lunch 35%, snack 10%, dinner 30%).
//   2. For each meal pick random dishes of the right category (e.g. lunch = Main + Staple + Side).
//   3. Scale the servings (0.5x to 3x) so the meal gets close to its calorie budget.

export const PLAN_CATEGORIES = ['Breakfast', 'Main', 'Staple', 'Snack', 'Side'];

const MEALS = [
  { slot: 'Breakfast', share: 0.25, parts: ['Breakfast'] },
  { slot: 'Lunch', share: 0.35, parts: ['Main', 'Staple', 'Side'] },
  { slot: 'Snack', share: 0.1, parts: ['Snack'] },
  { slot: 'Dinner', share: 0.3, parts: ['Main', 'Staple'] },
];

// Skip dishes whose single serving is unrealistically big for their role
const MAX_KCAL = { Breakfast: 500, Main: 500, Staple: 350, Snack: 400, Side: 150 };
const TRIES = 10; // for every meal we try 10 random combinations and keep the best one

const round1 = (n) => Math.round(n * 10) / 10;
const sum = (list) => list.reduce((total, n) => total + n, 0);

// Pick one random recipe, preferring ones we have not used yet in this plan
function pickOne(list, used, rng) {
  if (list.length === 0) return null;
  const fresh = list.filter((r) => !used.has(String(r._id)));
  const pool = fresh.length > 0 ? fresh : list;
  return pool[Math.floor(rng() * pool.length)];
}

// Works out the servings for a chosen set of dishes and how far it is from the calorie budget
function scaleMeal(chosen, mealBudget) {
  const sides = chosen.filter((r) => r.category === 'Side');
  const scalable = chosen.filter((r) => r.category !== 'Side');
  const sideCalories = sum(sides.map((r) => r.calories));
  const scalableCalories = sum(scalable.map((r) => r.calories));

  let scale = scalableCalories > 0 ? (mealBudget - sideCalories) / scalableCalories : 1;
  scale = Math.min(3, Math.max(0.5, Math.round(scale * 2) / 2)); // nearest half serving

  const total = sideCalories + scalableCalories * scale;
  return { scale, error: Math.abs(total - mealBudget) };
}

function buildMeal(meal, byCategory, used, targetCalories, rng) {
  const mealBudget = targetCalories * meal.share;

  // Try several random combinations and keep the one closest to the calorie budget
  let best = null;
  for (let i = 0; i < TRIES; i++) {
    const chosen = meal.parts.map((cat) => pickOne(byCategory[cat] || [], used, rng)).filter(Boolean);
    if (chosen.length === 0) return null;
    const { scale, error } = scaleMeal(chosen, mealBudget);
    if (!best || error < best.error) best = { chosen, scale, error };
  }

  const items = best.chosen.map((r) => {
    const servings = r.category === 'Side' ? 1 : best.scale; // sides stay at 1 serving
    used.add(String(r._id));
    return {
      recipeId: r._id,
      name: r.name,
      category: r.category,
      servings,
      calories: round1(r.calories * servings),
      protein: round1(r.protein * servings),
      carbs: round1(r.carbs * servings),
      fat: round1(r.fat * servings),
      fibre: round1(r.fibre * servings),
    };
  });
  return { slot: meal.slot, items };
}

export function generatePlan({ recipes, targetCalories, days = 1, maxTime = 240, rng = Math.random }) {
  // Group dishes by category. Prefer dishes that are quick enough (maxTime); if a category
  // has none, fall back to all of its dishes so a meal is never empty.
  const all = {};
  const quick = {};
  for (const r of recipes) {
    if (r.calories < 30 || r.calories > (MAX_KCAL[r.category] || 500)) continue; // skip near-zero or oversized dishes
    (all[r.category] ||= []).push(r);
    if ((r.timeMinutes ?? 0) <= maxTime) (quick[r.category] ||= []).push(r);
  }
  const byCategory = {};
  for (const cat of Object.keys(all)) byCategory[cat] = quick[cat]?.length ? quick[cat] : all[cat];

  const used = new Set();
  const plan = [];

  for (let day = 1; day <= days; day++) {
    const meals = MEALS.map((m) => buildMeal(m, byCategory, used, targetCalories, rng)).filter(Boolean);

    const all = meals.flatMap((m) => m.items);
    const totals = {
      calories: Math.round(sum(all.map((i) => i.calories))),
      protein: round1(sum(all.map((i) => i.protein))),
      carbs: round1(sum(all.map((i) => i.carbs))),
      fat: round1(sum(all.map((i) => i.fat))),
      fibre: round1(sum(all.map((i) => i.fibre))),
    };
    plan.push({ day, meals, totals });
  }
  return plan;
}
