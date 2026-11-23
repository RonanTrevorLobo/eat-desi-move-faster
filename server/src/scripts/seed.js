// Run with:  npm run seed
// 1. Reads data/Indian_Food_Nutrition_Updated.csv  (1,014 dishes)
// 2. Guesses diet type / category / region / meal (utils/classify.js)
// 3. Adds data/featured_recipes.json (the 21 hand-written recipes from the Figma design, with quantities, steps, photos)
// 4. Replaces all seeded recipes in MongoDB (recipes added by users are kept)
// 5. Creates the admin account from .env
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';

import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import { classifyRecipe } from '../utils/classify.js';
import { guessAisle } from '../utils/aisle.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');

const num = (v) => (v === '' || v === undefined || Number.isNaN(Number(v)) ? 0 : Number(v));

// CSV row -> recipe document (exported so the tests can use it)
export function rowToRecipe(row) {
  const name = row['Dish Name'].trim();
  const ingredientsText = row['Ingredients'] || '';
  const ingredients = ingredientsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .map((n) => ({ name: n, qty: '', cat: guessAisle(n) }));

  return {
    name,
    ...classifyRecipe(name, ingredientsText),
    calories: num(row['Calories (kcal)']),
    carbs: num(row['Carbohydrates (g)']),
    protein: num(row['Protein (g)']),
    fat: num(row['Fats (g)']),
    sugar: num(row['Free Sugar (g)']),
    fibre: num(row['Fibre (g)']),
    sodium: num(row['Sodium (mg)']),
    calcium: num(row['Calcium (mg)']),
    iron: num(row['Iron (mg)']),
    vitaminC: num(row['Vitamin C (mg)']),
    folate: num(row['Folate (µg)']),
    ingredients,
    timeMinutes: num(row['Time Taken (minutes)']) || 30,
    createdBy: null,
  };
}

async function run() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing. Create server/.env first.');
  await mongoose.connect(process.env.MONGO_URI);

  const rows = parse(fs.readFileSync(path.join(dataDir, 'Indian_Food_Nutrition_Updated.csv'), 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });
  const fromCsv = rows.map(rowToRecipe);
  const featured = JSON.parse(fs.readFileSync(path.join(dataDir, 'featured_recipes.json'), 'utf8')).map((r) => ({ ...r, createdBy: null }));

  await Recipe.deleteMany({ createdBy: null });
  await Recipe.insertMany([...featured, ...fromCsv]);
  console.log(`Inserted ${fromCsv.length} recipes from the CSV + ${featured.length} featured recipes`);

  // Admin account
  const email = (process.env.ADMIN_EMAIL || 'admin@eatdesi.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  if (!(await User.findOne({ email }))) {
    await User.create({ name: 'Admin', email, passwordHash: await bcrypt.hash(password, 10), role: 'admin' });
    console.log(`Admin created: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  await mongoose.disconnect();
}

// Only run when started with "npm run seed" (not when a test imports rowToRecipe)
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
}
