import { Router } from 'express';
import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { DIET_TYPES } from '../utils/constants.js';
import { buildPlanFor } from '../utils/planService.js';

const router = Router();
router.use(requireAuth);

// POST /api/plans/generate  { days: 1 or 7, calories?, diet?, maxTime? }  -> returns a plan but does NOT save it
router.post('/generate', async (req, res) => {
  const user = await User.findById(req.user.id);
  const days = Number(req.body?.days) === 7 ? 7 : 1;
  const targetCalories = Math.min(3200, Math.max(1200, Number(req.body?.calories) || user.kcal));
  const dietType = DIET_TYPES.includes(req.body?.diet) ? req.body.diet : user.diet;
  const maxTime = Math.min(240, Math.max(10, Number(req.body?.maxTime) || 240));

  const plan = await buildPlanFor({ dietType, allergies: user.allergies, maxTime, targetCalories, days });
  if (!plan) return res.status(400).json({ error: 'No recipes found. Ask your team to run "npm run seed" in the server folder.' });
  res.json(plan);
});

// POST /api/plans  -> save a plan { name, targetCalories, dietType, days }
router.post('/', async (req, res) => {
  const { name, targetCalories, dietType, days } = req.body || {};
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Give the plan a name (at least 2 characters)');
  if (!Array.isArray(days) || days.length === 0) errors.push('The plan has no days');
  if (errors.length > 0) return res.status(400).json({ errors });

  const plan = await Plan.create({ user: req.user.id, name: name.trim(), targetCalories, dietType, days });
  res.status(201).json(plan);
});

// GET /api/plans  -> short list of my saved plans
router.get('/', async (req, res) => {
  const plans = await Plan.find({ user: req.user.id }).sort({ createdAt: -1 }).select('name targetCalories dietType createdAt days.day');
  res.json(plans);
});

// GET /api/plans/:id
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Plan not found' });
  const plan = await Plan.findOne({ _id: req.params.id, user: req.user.id });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json(plan);
});

// DELETE /api/plans/:id
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Plan not found' });
  await Plan.deleteOne({ _id: req.params.id, user: req.user.id });
  res.json({ ok: true });
});

export default router;
