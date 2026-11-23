import mongoose from 'mongoose';
import { DIET_TYPES, ALLERGIES, THEMES, ACTIVITY_LEVELS, GOALS } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Preferences chosen in the sign-up steps / Profile screen
    diet: { type: String, enum: DIET_TYPES, default: 'Vegetarian' },
    allergies: [{ type: String, enum: ALLERGIES }],
    kcal: { type: Number, default: 2000, min: 1200, max: 3200 }, // daily calorie goal
    theme: { type: String, enum: THEMES, default: 'sun' },

    // Optional: body stats used by "Calculate my target" (utils/calories.js)
    body: {
      age: Number,
      gender: { type: String, enum: ['male', 'female'] },
      heightCm: Number,
      weightKg: Number,
      activityLevel: { type: String, enum: ACTIVITY_LEVELS },
      goal: { type: String, enum: GOALS },
    },
    targets: { bmr: Number, tdee: Number, calories: Number, protein: Number, carbs: Number, fat: Number },

    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  },
  {
    timestamps: true,
    toJSON: {
      // Never send the password hash (or the favourites list) to the browser
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.favourites;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model('User', userSchema);
