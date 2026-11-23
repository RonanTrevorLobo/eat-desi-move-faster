import test from 'node:test';
import assert from 'node:assert/strict';
import { filterForAllergies } from '../src/utils/allergens.js';
import { matchInfo, has } from '../src/utils/pantry.js';

const dish = (name, ings) => ({ name, ingredients: ings.map((n) => ({ name: n, qty: '' })) });

test('allergy filter removes dishes containing the allergen', () => {
  const list = [dish('Palak paneer', ['Spinach', 'Paneer']), dish('Dal', ['Toor dal']), dish('Peanut chaat', ['Peanuts'])];
  assert.deepEqual(filterForAllergies(list, ['Dairy']).map((r) => r.name), ['Dal', 'Peanut chaat']);
  assert.deepEqual(filterForAllergies(list, ['Dairy', 'Peanuts']).map((r) => r.name), ['Dal']);
  assert.equal(filterForAllergies(list, []).length, 3);
});

test('pantry matching understands aliases and ignores oil/salt', () => {
  assert.ok(has(['atta'], 'Whole wheat flour'));
  assert.ok(has(['palak'], 'Spinach'));
  const r = dish('Palak roti', ['Spinach', 'Whole wheat flour', 'Oil', 'Salt']);
  const m = matchInfo(r, ['palak']);
  assert.deepEqual(m.have, ['Spinach']);
  assert.deepEqual(m.missing, ['Whole wheat flour']);
  assert.equal(m.total, 2);
});
