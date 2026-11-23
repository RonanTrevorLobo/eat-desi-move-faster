import { DIET_TYPES, ALLERGIES, THEMES, ACTIVITY_LEVELS, GOALS } from '../utils/constants.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// If errors were found, answer 400 with { errors: [...] } (same style as Module 4)
function finish(errors, res, next) {
  if (errors.length > 0) return res.status(400).json({ errors });
  next();
}

// Checks the optional preference fields (diet, allergies, kcal, theme) if they were sent
function preferenceErrors(b) {
  const errors = [];
  if (b.diet !== undefined && !DIET_TYPES.includes(b.diet)) errors.push('Choose a valid diet type');
  if (b.allergies !== undefined && !(Array.isArray(b.allergies) && b.allergies.every((a) => ALLERGIES.includes(a)))) {
    errors.push('Allergies must be chosen from the list');
  }
  if (b.kcal !== undefined && !(Number(b.kcal) >= 1200 && Number(b.kcal) <= 3200)) errors.push('Daily calories must be between 1200 and 3200');
  if (b.theme !== undefined && !THEMES.includes(b.theme)) errors.push('Unknown theme');
  return errors;
}

export function validateRegister(req, res, next) {
  const b = req.body || {};
  const errors = [];
  if (!b.name || b.name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!b.email || !EMAIL.test(b.email)) errors.push('Enter a valid email address');
  if (!b.password || b.password.length < 8 || !/\d/.test(b.password)) errors.push('Password needs 8+ characters and a number');
  finish([...errors, ...preferenceErrors(b)], res, next);
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  finish(errors, res, next);
}

export function validatePreferences(req, res, next) {
  finish(preferenceErrors(req.body || {}), res, next);
}

export function validateBody(req, res, next) {
  const { age, gender, heightCm, weightKg, activityLevel, goal } = req.body || {};
  const errors = [];
  if (!(Number(age) >= 10 && Number(age) <= 100)) errors.push('Age must be between 10 and 100');
  if (!['male', 'female'].includes(gender)) errors.push('Choose male or female');
  if (!(Number(heightCm) >= 100 && Number(heightCm) <= 250)) errors.push('Height must be between 100 and 250 cm');
  if (!(Number(weightKg) >= 30 && Number(weightKg) <= 250)) errors.push('Weight must be between 30 and 250 kg');
  if (!ACTIVITY_LEVELS.includes(activityLevel)) errors.push('Choose an activity level');
  if (!GOALS.includes(goal)) errors.push('Choose a goal');
  finish(errors, res, next);
}
