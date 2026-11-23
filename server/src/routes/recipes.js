import { Router } from 'express';
import mongoose from 'mongoose';
import Recipe from '../models/Recipe.js';
import { requireAuth } from '../middleware/auth.js';
import { CATEGORIES, DIET_TYPES, ZONES, MEALS } from '../utils/constants.js';
import { guessAisle } from '../utils/aisle.js';

const router = Router();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Accepts ['Rice', ...] or [{name:'Rice', qty:'1 cup'}, ...] and returns clean [{name, qty, cat}]
function cleanIngredients(value) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[\n,]/) : [];
  return list
    .map((i) => (typeof i === 'string' ? { name: i.trim(), qty: '' } : { name: String(i?.name || '').trim(), qty: String(i?.qty || '').trim() }))
    .filter((i) => i.name)
    .map((i) => ({ ...i, cat: guessAisle(i.name) }));
}

const cleanSteps = (value) => (Array.isArray(value) ? value.map((s) => String(s).trim()).filter(Boolean) : []);
const num = (v) => (v === '' || v === undefined || v === null || Number.isNaN(Number(v)) ? 0 : Math.max(0, Number(v)));

// Checks the body of POST / PUT and, if OK, stores the cleaned data in req.recipeData
function validateRecipe(req, res, next) {
  const b = req.body || {};
  const errors = [];
  if (!b.name || b.name.trim().length < 3) errors.push('Dish name must be at least 3 characters');
  if (!ZONES.includes(b.zone)) errors.push('Choose a region');
  if (!DIET_TYPES.includes(b.dietType)) errors.push('Choose a diet type');
  if (b.meal !== undefined && !MEALS.includes(b.meal)) errors.push('Meal must be Breakfast, Lunch, Dinner or Snack');
  if (b.calories === '' || b.calories === undefined || !(Number(b.calories) >= 0)) errors.push('Calories are required');
  if (!(Number(b.timeMinutes) > 0)) errors.push('Enter the total time in minutes');
  if (b.servings !== undefined && !(Number(b.servings) >= 1)) errors.push('Servings must be 1 or more');
  const ingredients = cleanIngredients(b.ingredients);
  if (ingredients.length === 0) errors.push('Add at least one ingredient');
  const img = typeof b.img === 'string' ? b.img : '';
  if (img && !(img.startsWith('http') || img.startsWith('data:image/'))) errors.push('Photo must be an image');
  if (img.length > 2_500_000) errors.push('Photo is too large (keep it under 1.5 MB)');
  if (errors.length > 0) return res.status(400).json({ errors });

  const meal = MEALS.includes(b.meal) ? b.meal : 'Lunch';
  // The meal planner needs a category. Derive it from the meal if the client did not send one.
  const category = CATEGORIES.includes(b.category) ? b.category : meal === 'Breakfast' ? 'Breakfast' : meal === 'Snack' ? 'Snack' : 'Main';

  req.recipeData = {
    name: b.name.trim(),
    zone: b.zone,
    region: typeof b.region === 'string' ? b.region : '',
    category,
    meal,
    dietType: b.dietType,
    calories: Number(b.calories),
    protein: num(b.protein),
    carbs: num(b.carbs),
    fat: num(b.fat),
    fibre: num(b.fibre),
    sodium: num(b.sodium),
    ingredients,
    steps: cleanSteps(b.steps),
    timeMinutes: Number(b.timeMinutes),
    servings: Number(b.servings) || 1,
    estimated: Boolean(b.estimated),
    img,
  };
  next();
}

// Only the owner or an admin may change a recipe
function canEdit(recipe, user) {
  return user.role === 'admin' || (recipe.createdBy && String(recipe.createdBy) === user.id);
}

// GET /api/recipes?search=&category=&dietType=&zone=&maxCalories=&page=&limit=
// The website loads everything once (limit=2000) and filters in the browser;
// these query parameters are for Postman, the chatbot and future pagination.
router.get('/', async (req, res) => {
  const { search, category, dietType, zone, maxCalories } = req.query;
  const filter = {};

  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: rx }, { zone: rx }, { 'ingredients.name': rx }];
  }
  if (CATEGORIES.includes(category)) filter.category = category;
  if (DIET_TYPES.includes(dietType)) filter.dietType = dietType;
  if (ZONES.includes(zone)) filter.zone = zone;
  if (Number(maxCalories) > 0) filter.calories = { $lte: Number(maxCalories) };

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(2000, Math.max(1, Number(req.query.limit) || 24));

  const total = await Recipe.countDocuments(filter);
  const recipes = await Recipe.find(filter)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ recipes, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

// GET /api/recipes/mine  (must be above /:id)
router.get('/mine', requireAuth, async (req, res) => {
  const recipes = await Recipe.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  res.json({ recipes, total: recipes.length, page: 1, pages: 1 });
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Recipe not found' });
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  res.json(recipe);
});

// POST /api/recipes
router.post('/', requireAuth, validateRecipe, async (req, res) => {
  const recipe = await Recipe.create({ ...req.recipeData, createdBy: req.user.id });
  res.status(201).json(recipe);
});

// PUT /api/recipes/:id
router.put('/:id', requireAuth, validateRecipe, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Recipe not found' });
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  if (!canEdit(recipe, req.user)) return res.status(403).json({ error: 'You can only edit your own recipes' });

  recipe.set(req.recipeData);
  await recipe.save();
  res.json(recipe);
});

// DELETE /api/recipes/:id
router.delete('/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Recipe not found' });
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  if (!canEdit(recipe, req.user)) return res.status(403).json({ error: 'You can only delete your own recipes' });

  await recipe.deleteOne();
  res.json({ ok: true });
});

export default router;
