// Calculates daily calorie + macro targets.
// Formula: Mifflin-St Jeor (BMR) x activity factor, then adjusted for the goal.
const ACTIVITY_FACTOR = {
  sedentary: 1.2, // desk job, little exercise
  light: 1.375, // exercise 1-3 days a week
  moderate: 1.55, // exercise 3-5 days a week
  active: 1.725, // exercise 6-7 days a week
  very_active: 1.9, // physical job + training
};

export function calculateTargets({ age, gender, heightCm, weightKg, activityLevel, goal }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'male' ? base + 5 : base - 161;
  const tdee = bmr * ACTIVITY_FACTOR[activityLevel];

  const adjustment = goal === 'lose' ? -500 : goal === 'gain' ? 400 : 0;
  const calories = Math.max(1200, Math.round(tdee + adjustment)); // never go below 1200

  const protein = Math.round(weightKg * (goal === 'maintain' ? 1.2 : 1.6)); // grams
  const fat = Math.round((calories * 0.25) / 9); // 25% of calories, 9 kcal per gram
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4)); // the rest

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calories, protein, carbs, fat };
}
