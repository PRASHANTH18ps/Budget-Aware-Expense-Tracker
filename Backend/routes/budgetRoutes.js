import express from "express";
import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Create or update budget (upsert)
router.post("/", auth, async (req, res) => {
  try {
    const { categoryId, month, limit } = req.body;
    if (!categoryId || !month || limit == null) return res.status(400).json({ message: "Missing fields" });

    // ensure category belongs to user
    const cat = await Category.findOne({ _id: categoryId, userId: req.user._id });
    if (!cat) return res.status(400).json({ message: "Invalid category" });

    const bud = await Budget.findOneAndUpdate(
      { userId: req.user._id, categoryId, month },
      { limit },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(bud);
  } catch (err) {
    console.error("Budget post error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get budgets for a month
router.get("/:month", auth, async (req, res) => {
  try {
    const { month } = req.params;
    const budgets = await Budget.find({ userId: req.user._id, month }).populate("categoryId");
    res.json(budgets);
  } catch (err) {
    console.error("Budget get error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete budget
router.delete("/:id", auth, async (req, res) => {
  try {
    await Budget.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Budget delete error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
