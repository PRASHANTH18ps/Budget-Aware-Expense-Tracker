import express from "express";
import Category from "../models/Category.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Create category
router.post("/", auth, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });
    const cat = await Category.create({ userId: req.user._id, name, color });
    return res.status(201).json(cat);
  } catch (err) {
    console.error("Category create error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get categories for user
router.get("/", auth, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id }).sort("name");
    res.json(categories);
  } catch (err) {
    console.error("Category list error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update category
router.put("/:id", auth, async (req, res) => {
  try {
    const cat = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name: req.body.name, color: req.body.color },
      { new: true }
    );
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  } catch (err) {
    console.error("Category update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete category
router.delete("/:id", auth, async (req, res) => {
  try {
    await Category.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Category delete error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
