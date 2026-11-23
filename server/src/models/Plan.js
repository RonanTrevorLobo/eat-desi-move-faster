import mongoose from 'mongoose';

// A saved meal plan. We copy the dish name + numbers into the plan ("snapshot")
// so the plan still reads correctly even if a recipe is edited or deleted later.
const itemSchema = new mongoose.Schema(
  {
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    name: String,
    category: String,
    servings: Number,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fibre: Number,
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema({ slot: String, items: [itemSchema] }, { _id: false });

const daySchema = new mongoose.Schema(
  {
    day: Number,
    meals: [mealSchema],
    totals: { calories: Number, protein: Number, carbs: Number, fat: Number, fibre: Number },
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    targetCalories: Number,
    dietType: String,
    days: [daySchema],
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
