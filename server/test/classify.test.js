import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRecipe } from '../src/utils/classify.js';

test('chicken curry is Non-Veg main', () => {
  const r = classifyRecipe('Chicken curry', 'Chicken, onion, tomato, spices');
  assert.equal(r.dietType, 'Non-Veg');
  assert.equal(r.category, 'Main');
});

test('boiled egg is Eggetarian breakfast', () => {
  const r = classifyRecipe('Boiled egg (Ubla anda)', 'Egg, water, salt');
  assert.equal(r.dietType, 'Eggetarian');
  assert.equal(r.category, 'Breakfast');
});

test('eggplant is not treated as egg', () => {
  assert.equal(classifyRecipe('Brinjal bhartha', 'Eggplant, onion, tomato').dietType, 'Vegan');
});

test('paneer dishes are Vegetarian (dairy), dal without dairy is Vegan', () => {
  assert.equal(classifyRecipe('Shahi paneer', 'Paneer, cream, tomato').dietType, 'Vegetarian');
  assert.equal(classifyRecipe('Mixed dal', 'Dal, onion, tomato, oil').dietType, 'Vegan');
});

test('idli is a South Indian breakfast', () => {
  const r = classifyRecipe('Idli', 'Rice, urad dal');
  assert.equal(r.category, 'Breakfast');
  assert.equal(r.zone, 'South Indian');
  assert.equal(r.meal, 'Breakfast');
});

test('roti is a staple, kheer is a dessert, lassi is a beverage, raita is a side', () => {
  assert.equal(classifyRecipe('Chapati/Roti', 'Atta').category, 'Staple');
  assert.equal(classifyRecipe('Rice kheer', 'Rice, milk').category, 'Dessert');
  assert.equal(classifyRecipe('Sweet Lassi', 'Curd').category, 'Beverage');
  assert.equal(classifyRecipe('Cucumber raita', 'Curd').category, 'Side');
});

test('pickles, sauces and masalas are Other; masala dosa is still breakfast', () => {
  assert.equal(classifyRecipe('Mango pickle (Aam ka achaar)', 'Mango').category, 'Other');
  assert.equal(classifyRecipe('White sauce (thin)', 'Milk, flour').category, 'Other');
  assert.equal(classifyRecipe('Garam masala', 'Spices').category, 'Other');
  assert.equal(classifyRecipe('Masala dosa', 'Rice').category, 'Breakfast');
  assert.equal(classifyRecipe('Shahi chicken masala', 'Chicken').category, 'Main');
});

test('squash is a beverage, rabri is a dessert', () => {
  assert.equal(classifyRecipe('Pineapple squash', 'Pineapple').category, 'Beverage');
  assert.equal(classifyRecipe('Thickened sweetened milk (Rabri)', 'Milk').category, 'Dessert');
});

test('desserts go to the Desserts region, chaat to Street Food, dhokla to West Indian', () => {
  assert.equal(classifyRecipe('Rice kheer', 'Rice, milk').zone, 'Desserts');
  assert.equal(classifyRecipe('Sprouts chaat', 'Sprouts').zone, 'Street Food');
  assert.equal(classifyRecipe('Khaman dhokla', 'Besan').zone, 'West Indian');
  assert.equal(classifyRecipe('Dal tadka', 'Dal').zone, 'North Indian');
});

test('meal label: breakfast stays breakfast, curries are lunch, desserts are snacks', () => {
  assert.equal(classifyRecipe('Poha', 'Poha').meal, 'Breakfast');
  assert.equal(classifyRecipe('Dal tadka', 'Dal').meal, 'Lunch');
  assert.equal(classifyRecipe('Rice kheer', 'Rice, milk').meal, 'Snack');
});
