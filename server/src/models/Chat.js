import mongoose from 'mongoose';

// One chat document per user, holding all of that user's messages.
// A bot message can also carry recipe cards (recipeIds) or a meal plan (plan).
const chatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        kind: { type: String, enum: ['text', 'recipes', 'plan'], default: 'text' },
        recipeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
        plan: { type: mongoose.Schema.Types.Mixed, default: null },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Chat', chatSchema);
