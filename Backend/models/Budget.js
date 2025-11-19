import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  month:      { type: String, required: true }, // e.g. "2025-06"
  limit:      { type: Number, required: true }
}, { timestamps: true });

budgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
