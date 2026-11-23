import { Router } from 'express';
import Chat from '../models/Chat.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { DIET_TYPES } from '../utils/constants.js';
import { allowedDietTypes, filterForDiet } from '../utils/diet.js';
import { filterForAllergies } from '../utils/allergens.js';
import { matchInfo } from '../utils/pantry.js';
import { buildPlanFor } from '../utils/planService.js';
import { buildSystemPrompt, askAI } from '../utils/aiService.js';

const router = Router();
router.use(requireAuth);

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Picks the best 3 recipes for the message + pantry (same idea as the original Figma prototype):
// fewer missing ingredients is better, calories close to a quarter of the daily goal is better.
async function findSuggestions({ user, diet, maxTime, kcal, message, pantry }) {
  const s = message.toLowerCase();

  let categories = ['Breakfast', 'Main', 'Staple', 'Snack'];
  if (/dessert|sweet/.test(s)) categories = ['Dessert'];
  else if (/breakfast/.test(s)) categories = ['Breakfast'];
  else if (/snack/.test(s)) categories = ['Snack'];
  else if (/\b(lunch|dinner)\b/.test(s)) categories = ['Main'];

  const query = { dietType: { $in: allowedDietTypes(diet) }, timeMinutes: { $lte: maxTime }, category: { $in: categories } };
  const direction = s.match(/\b(north|south|east|west)\b/);
  if (direction) query.zone = `${direction[1][0].toUpperCase()}${direction[1].slice(1)} Indian`;
  else if (/street/.test(s)) query.zone = 'Street Food';
  else if (/continental/.test(s)) query.zone = 'Continental';

  const found = await Recipe.find(query).lean();
  const pool = filterForAllergies(filterForDiet(found, diet), user.allergies);

  const wantsProtein = /protein/.test(s);
  const score = (r) => {
    const m = matchInfo(r, pantry);
    return (m.total ? m.have.length / m.total : 0) - Math.abs(r.calories - kcal / 4) / 4000 + (wantsProtein ? r.protein / 100 : 0);
  };
  let top = [...pool].sort((a, b) => score(b) - score(a));
  if (pantry.length > 0) {
    const hits = top.filter((r) => matchInfo(r, pantry).have.length > 0);
    if (hits.length > 0) top = hits;
  }
  return top.slice(0, 3);
}

// GET /api/chat -> my chat history
router.get('/', async (req, res) => {
  const chat = await Chat.findOne({ user: req.user.id });
  res.json(chat ? chat.messages : []);
});

// POST /api/chat  { message, pantry, diet, maxTime, kcal }
// -> { kind: 'plan' | 'recipes' | 'text', reply, plan?, recipes? }
router.post('/', async (req, res) => {
  const message = (req.body?.message || '').trim();
  if (message.length === 0) return res.status(400).json({ errors: ['Type a message first'] });
  if (message.length > 500) return res.status(400).json({ errors: ['Message is too long (max 500 characters)'] });

  const user = await User.findById(req.user.id);
  const pantry = (Array.isArray(req.body.pantry) ? req.body.pantry : [])
    .map((p) => String(p).toLowerCase().trim())
    .filter(Boolean)
    .slice(0, 40);
  const diet = DIET_TYPES.includes(req.body.diet) ? req.body.diet : user.diet;
  const maxTime = clamp(Number(req.body.maxTime) || 45, 10, 240);
  const kcal = clamp(Number(req.body.kcal) || user.kcal, 1200, 3200);

  const chat = (await Chat.findOne({ user: user._id })) || new Chat({ user: user._id, messages: [] });
  const userMessage = { role: 'user', content: message, kind: 'text' };
  let answer; // the bot message we will save and return

  if (/plan|week|daily|7.?day/i.test(message)) {
    // ---- Meal plan request: built by our planner, no AI needed ----
    const days = /week|7.?day/i.test(message) ? 7 : 1;
    const plan = await buildPlanFor({ dietType: diet, allergies: user.allergies, maxTime, targetCalories: kcal, days });
    if (!plan) return res.status(400).json({ error: 'No recipes found. Ask your team to run "npm run seed" in the server folder.' });

    const avg = Math.round(plan.days.reduce((sum, d) => sum + d.totals.calories, 0) / days);
    answer = {
      kind: 'plan',
      reply: `Here is a ${days === 7 ? 'weekly' : 'daily'} ${diet.toLowerCase()} plan averaging ${avg} kcal per day against your ${kcal} kcal target.`,
      plan,
    };
  } else {
    // ---- Recipe / nutrition question: pick recipes, let the AI write the answer ----
    const suggestions = await findSuggestions({ user, diet, maxTime, kcal, message, pantry });
    if (suggestions.length === 0) {
      answer = { kind: 'text', reply: 'I could not find a recipe within those limits. Try a longer cooking time or a different diet.' };
    } else {
      let reply = null;
      try {
        const history = chat.messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
        history.push({ role: 'user', content: message });
        reply = await askAI(buildSystemPrompt(user, { diet, kcal, maxTime, pantry }, suggestions), history);
      } catch (err) {
        console.error(err.message); // the user still gets recipe cards below
      }
      if (!reply) {
        reply = pantry.length
          ? `With ${pantry.length} pantry item${pantry.length > 1 ? 's' : ''}, these ${diet.toLowerCase()} dishes need the fewest extras:`
          : 'Here are balanced picks that fit your time and calories:';
      }
      answer = { kind: 'recipes', reply, recipes: suggestions };
    }
  }

  chat.messages.push(userMessage);
  chat.messages.push({
    role: 'assistant',
    content: answer.reply,
    kind: answer.kind,
    recipeIds: answer.recipes?.map((r) => r._id) || [],
    plan: answer.plan || null,
  });
  chat.messages = chat.messages.slice(-60); // keep the last 60 only
  await chat.save();

  res.json(answer);
});

// DELETE /api/chat -> clear my chat history
router.delete('/', async (req, res) => {
  await Chat.deleteOne({ user: req.user.id });
  res.json({ ok: true });
});

export default router;
