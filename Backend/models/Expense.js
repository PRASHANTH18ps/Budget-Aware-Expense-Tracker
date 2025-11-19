import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  amount:     { type: Number, required: true },
  date:       { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
