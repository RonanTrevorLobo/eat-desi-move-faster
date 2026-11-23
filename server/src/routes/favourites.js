import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/favourites/ids -> ["64f...", "64a..."]  (what the heart buttons need)
router.get('/ids', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user ? user.favourites.map(String) : []);
});

// GET /api/favourites -> full recipe objects
router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('favourites');
  res.json(user ? user.favourites : []);
});

// POST /api/favourites/:recipeId -> toggles (adds if missing, removes if present)
router.post('/:recipeId', requireAuth, async (req, res) => {
  const { recipeId } = req.params;
  if (!mongoose.isValidObjectId(recipeId)) return res.status(404).json({ error: 'Recipe not found' });
  if (!(await Recipe.exists({ _id: recipeId }))) return res.status(404).json({ error: 'Recipe not found' });

  const user = await User.findById(req.user.id);
  const index = user.favourites.findIndex((id) => String(id) === recipeId);
  if (index >= 0) user.favourites.splice(index, 1);
  else user.favourites.push(recipeId);
  await user.save();

  res.json({ favourite: index < 0 });
});

export default router;
