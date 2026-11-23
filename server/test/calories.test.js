import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTargets } from '../src/utils/calories.js';

const man = { age: 25, gender: 'male', heightCm: 175, weightKg: 70, activityLevel: 'light', goal: 'maintain' };

test('maintenance calories for a 25 y/o man, 175 cm, 70 kg, light activity', () => {
  const t = calculateTargets(man);
  assert.equal(t.bmr, 1674);
  assert.ok(Math.abs(t.calories - 2301) <= 1);
});

test('losing weight gives fewer calories than maintaining', () => {
  const keep = calculateTargets(man).calories;
  const lose = calculateTargets({ ...man, goal: 'lose' }).calories;
  assert.equal(keep - lose, 500);
});

test('calories never drop below 1200', () => {
  const t = calculateTargets({ age: 80, gender: 'female', heightCm: 140, weightKg: 35, activityLevel: 'sedentary', goal: 'lose' });
  assert.equal(t.calories, 1200);
});
