// Fetches suitable recipes from MongoDB and builds a plan.
// Used by BOTH the /api/plans/generate route and the chatbot ("weekly meal plan").
import Recipe from '../models/Recipe.js';
import { allowedDietTypes, filterForDiet } from './diet.js';
import { filterForAllergies } from './allergens.js';
import { generatePlan, PLAN_CATEGORIES } from './mealPlanner.js';

// Returns { name, targetCalories, dietType, days } or null if no recipes are suitable
export async function buildPlanFor({ dietType, allergies = [], maxTime = 240, targetCalories, days = 1 }) {
  const recipes = await Recipe.find({
    dietType: { $in: allowedDietTypes(dietType) },
    category: { $in: PLAN_CATEGORIES },
  })
    .select('-img') // photos are not needed to build a plan
    .lean();

  const usable = filterForAllergies(filterForDiet(recipes, dietType), allergies);
  if (usable.length === 0) return null;

  return {
    name: days === 7 ? 'Weekly plan' : 'Daily plan',
    targetCalories,
    dietType,
    days: generatePlan({ recipes: usable, targetCalories, days, maxTime }),
  };
}
