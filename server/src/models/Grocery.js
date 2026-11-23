import mongoose from 'mongoose';
import { AISLES } from '../utils/constants.js';

// One shopping-list row for one user. Field names match the UI (done, from, cat).
const grocerySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    qty: { type: String, default: '' },
    cat: { type: String, enum: AISLES, default: 'Other' },
    from: { type: [String], default: [] }, // recipe names this item is "for"
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Grocery', grocerySchema);
