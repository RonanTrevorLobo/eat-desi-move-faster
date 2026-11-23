import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePlan } from '../src/utils/mealPlanner.js';
import { allowedDietTypes, filterForDiet } from '../src/utils/diet.js';

// A tiny fake recipe list (no database needed)
let id = 0;
const make = (name, category, calories, extra = {}) => ({
  _id: String(++id), name, category, calories, timeMinutes: 20, protein: calories / 20, carbs: calories / 8, fat: calories / 30, fibre: 2, ingredients: ['x'], ...extra,
});
const recipes = [
  make('Poha', 'Breakfast', 250), make('Idli', 'Breakfast', 120), make('Upma', 'Breakfast', 200),
  make('Dal', 'Main', 150), make('Paneer curry', 'Main', 300), make('Sabzi', 'Main', 120, { timeMinutes: 90 }),
  make('Roti', 'Staple', 100), make('Rice', 'Staple', 180),
  make('Cucumber raita', 'Side', 60), make('Samosa', 'Snack', 260),
];

test('a daily plan has 4 meals and is not wildly off the target', () => {
  const [day] = generatePlan({ recipes, targetCalories: 2000, days: 1 });
  assert.equal(day.meals.length, 4);
  assert.deepEqual(day.meals.map((m) => m.slot), ['Breakfast', 'Lunch', 'Snack', 'Dinner']);
  assert.ok(day.totals.calories > 1000 && day.totals.calories < 3200, `got ${day.totals.calories}`);
});

test('a weekly plan has 7 days', () => {
  const plan = generatePlan({ recipes, targetCalories: 1800, days: 7 });
  assert.equal(plan.length, 7);
});

test('servings stay between 0.5 and 3', () => {
  const [day] = generatePlan({ recipes, targetCalories: 4000, days: 1 });
  for (const meal of day.meals) for (const item of meal.items) assert.ok(item.servings >= 0.5 && item.servings <= 3);
});

test('Vegetarians may eat Vegan dishes but not Non-Veg ones', () => {
  const allowed = allowedDietTypes('Vegetarian');
  assert.ok(allowed.includes('Vegan'));
  assert.ok(!allowed.includes('Non-Veg'));
});

test('Jain filter removes onion and potato dishes', () => {
  const list = [make('Aloo gobi', 'Main', 100, { ingredients: ['Potato', 'Cauliflower'] }), make('Lauki sabzi', 'Main', 80, { ingredients: ['Bottle gourd'] })];
  const kept = filterForDiet(list, 'Jain');
  assert.equal(kept.length, 1);
  assert.equal(kept[0].name, 'Lauki sabzi');
});

test('maxTime: slow dishes are skipped when quicker ones exist', () => {
  for (let i = 0; i < 20; i++) {
    const [day] = generatePlan({ recipes, targetCalories: 2000, days: 1, maxTime: 30 });
    const names = day.meals.flatMap((m) => m.items.map((it) => it.name));
    assert.ok(!names.includes('Sabzi'), 'Sabzi takes 90 min so it must not be chosen');
  }
});

test('Jain filter also works with {name, qty} ingredient objects', () => {
  const list = [make('Aloo gobi', 'Main', 100, { ingredients: [{ name: 'Potato', qty: '2' }] }), make('Lauki sabzi', 'Main', 80, { ingredients: [{ name: 'Bottle gourd', qty: '1' }] })];
  assert.equal(filterForDiet(list, 'Jain').length, 1);
});
