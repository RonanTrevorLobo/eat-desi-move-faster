import { Router } from 'express';
import mongoose from 'mongoose';
import Grocery from '../models/Grocery.js';
import Recipe from '../models/Recipe.js';
import { requireAuth } from '../middleware/auth.js';
import { guessAisle } from '../utils/aisle.js';

const router = Router();
router.use(requireAuth); // every grocery route needs a logged-in user

// Every route answers with the WHOLE updated list, so the UI just replaces its copy.
const listFor = (userId) => Grocery.find({ user: userId }).sort({ createdAt: 1 });

// GET /api/grocery
router.get('/', async (req, res) => {
  res.json(await listFor(req.user.id));
});

// POST /api/grocery  { name, qty }
router.post('/', async (req, res) => {
  const name = (req.body?.name || '').trim();
  if (name.length < 2) return res.status(400).json({ errors: ['Item name must be at least 2 characters'] });
  await Grocery.create({ user: req.user.id, name, qty: (req.body.qty || '').trim(), cat: guessAisle(name) });
  res.status(201).json(await listFor(req.user.id));
});

// POST /api/grocery/from-recipes  { recipeIds: [...], only?: ['onion', ...] }
// Adds the ingredients of the recipes. An item that is already on the list is not repeated:
// we just note the extra recipe in "from" and add the quantities together.
router.post('/from-recipes', async (req, res) => {
  const ids = (req.body?.recipeIds || []).filter((id) => mongoose.isValidObjectId(id));
  if (ids.length === 0) return res.status(400).json({ errors: ['No recipes given'] });
  const only = Array.isArray(req.body.only) ? req.body.only.map((n) => String(n).toLowerCase()) : null;

  const recipes = await Recipe.find({ _id: { $in: ids } });
  const items = await Grocery.find({ user: req.user.id });
  const changed = new Set();
  const fresh = [];

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      if (only && !only.includes(ing.name.toLowerCase())) continue;

      const key = ing.name.toLowerCase();
      const existing = items.find((i) => i.name.toLowerCase() === key) || fresh.find((i) => i.name.toLowerCase() === key);
      if (existing) {
        if (!existing.from.includes(recipe.name)) {
          existing.from.push(recipe.name);
          if (ing.qty) existing.qty = existing.qty ? `${existing.qty} + ${ing.qty}` : ing.qty;
          changed.add(existing);
        }
      } else {
        fresh.push({ user: req.user.id, name: ing.name, qty: ing.qty, cat: ing.cat || guessAisle(ing.name), from: [recipe.name], done: false });
      }
    }
  }

  await Promise.all([...changed].filter((i) => i.save).map((i) => i.save()));
  // "fresh" items that were merged into after creation are plain objects, so insert them as they are
  if (fresh.length > 0) await Grocery.insertMany(fresh);
  res.status(201).json(await listFor(req.user.id));
});

// PUT /api/grocery/:id  { done: true/false }
router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Item not found' });
  const item = await Grocery.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { done: Boolean(req.body?.done) });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(await listFor(req.user.id));
});

// DELETE /api/grocery            -> clear the whole list
// DELETE /api/grocery?done=true  -> clear only the ticked items   (must be above /:id)
router.delete('/', async (req, res) => {
  const filter = { user: req.user.id };
  if (req.query.done === 'true') filter.done = true;
  await Grocery.deleteMany(filter);
  res.json(await listFor(req.user.id));
});

// DELETE /api/grocery/:id
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Item not found' });
  await Grocery.deleteOne({ _id: req.params.id, user: req.user.id });
  res.json(await listFor(req.user.id));
});

export default router;
