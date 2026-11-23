import mongoose from 'mongoose';
import { DIET_TYPES, CATEGORIES, ZONES, MEALS, AISLES } from '../utils/constants.js';

// One ingredient line: { name: 'Paneer', qty: '200 g', cat: 'Dairy' }
const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qty: { type: String, default: '' },
    cat: { type: String, enum: AISLES, default: 'Pantry' }, // shopping-list aisle
  },
  { _id: false }
);

// One document = one dish. Nutrient values are PER SERVING.
const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    zone: { type: String, enum: ZONES, default: 'North Indian' }, // region chips in the UI
    region: { type: String, default: '' }, // e.g. "Gujarat" (only for the curated recipes)
    category: { type: String, enum: CATEGORIES, required: true }, // used by the meal planner
    meal: { type: String, enum: MEALS, default: 'Lunch' }, // shown on the card
    dietType: { type: String, enum: DIET_TYPES, required: true },

    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fibre: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    folate: { type: Number, default: 0 },

    ingredients: { type: [ingredientSchema], default: [] },
    steps: { type: [String], default: [] },
    timeMinutes: { type: Number, default: 30 },
    servings: { type: Number, default: 1 },
    estimated: { type: Boolean, default: false }, // true if the user left nutrition blank and the UI estimated it
    img: { type: String, default: '' }, // https URL or a small base64 data URL; '' = UI picks a placeholder photo
    featured: { type: Boolean, default: false }, // the 21 hand-written recipes from the Figma design

    // null = came from the dataset/seed, otherwise the user who added it
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Recipe', recipeSchema);
