import test from 'node:test';
import assert from 'node:assert/strict';
import { guessAisle } from '../src/utils/aisle.js';
test('aisle guesser groups ingredients like a supermarket', () => {
  assert.equal(guessAisle('Onion'), 'Produce');
  assert.equal(guessAisle('Paneer'), 'Dairy');
  assert.equal(guessAisle('Toor dal'), 'Grains & Pulses');
  assert.equal(guessAisle('Turmeric'), 'Spices');
  assert.equal(guessAisle('Chilli powder'), 'Spices'); // powder wins over chilli
  assert.equal(guessAisle('Chicken breast'), 'Protein');
  assert.equal(guessAisle('Coconut oil'), 'Pantry'); // oil wins over coconut
  assert.equal(guessAisle('Something unknown'), 'Pantry');
});
