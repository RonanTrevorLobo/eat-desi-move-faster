import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';

const router = Router();

function makeToken(user) {
  return jwt.sign({ id: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  const { name, email, password, diet, allergies, kcal, theme } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10); // never store the plain password
  const user = await User.create({
    name: name.trim(),
    email,
    passwordHash,
    // optional preferences from the 3-step sign-up (the model has defaults for anything missing)
    ...(diet && { diet }),
    ...(allergies && { allergies }),
    ...(kcal && { kcal: Number(kcal) }),
    ...(theme && { theme }),
  });
  res.status(201).json({ token: makeToken(user), user });
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Wrong email or password' });

  res.json({ token: makeToken(user), user });
});

// GET /api/auth/me  -> the logged-in user
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Account not found. Please log in again' });
  res.json(user);
});

export default router;
