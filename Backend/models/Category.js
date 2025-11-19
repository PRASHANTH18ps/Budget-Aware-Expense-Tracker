import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:   { type: String, required: true },
  color:  { type: String, default: "#3498db" }
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
