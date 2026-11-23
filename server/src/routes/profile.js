import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validatePreferences, validateBody } from '../middleware/validate.js';
import { calculateTargets } from '../utils/calories.js';

const router = Router();
router.use(requireAuth);

// PUT /api/profile  { diet?, allergies?, kcal?, theme? }  -> save the preferences that were sent
router.put('/', validatePreferences, async (req, res) => {
  const updates = {};
  for (const key of ['diet', 'allergies', 'kcal', 'theme']) {
    if (req.body[key] !== undefined) updates[key] = key === 'kcal' ? Number(req.body[key]) : req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });
  res.json(user);
});

// POST /api/profile/calculate  { age, gender, heightCm, weightKg, activityLevel, goal }
// Works out calorie + macro targets, saves them and sets the daily calorie goal to match.
router.post('/calculate', validateBody, async (req, res) => {
  const { age, gender, heightCm, weightKg, activityLevel, goal } = req.body;
  const body = { age: Number(age), gender, heightCm: Number(heightCm), weightKg: Number(weightKg), activityLevel, goal };
  const targets = calculateTargets(body);
  const kcal = Math.min(3200, Math.max(1200, targets.calories));

  const user = await User.findByIdAndUpdate(req.user.id, { $set: { body, targets, kcal } }, { new: true });
  res.json(user);
});

export default router;
