import express from 'express';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import auth from '../middleware/authMiddleware.js';
const router = express.Router();

// POST /expenses - Add a new expense and check budget
router.post('/', auth, async (req, res) => {
  try {
    const { categoryId, amount, date } = req.body;
    const userId = req.user.id; // from auth middleware

    // Validate input
    if (!categoryId || !amount || !date) {
      return res.status(400).json({ message: 'Category ID, amount, and date are required' });
    }

    // Check if category exists and belongs to user
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create expense
    const expense = new Expense({ userId, categoryId, amount, date: new Date(date) });
    await expense.save();

    // Check budget for the category
    const monthStr = `${new Date(date).getFullYear()}-${String(new Date(date).getMonth() + 1).padStart(2, '0')}`;
    const budget = await Budget.findOne({ userId, categoryId, month: monthStr });
    let withinBudget = true;
    if (budget) {
      const totalExpenses = await Expense.aggregate([
        { $match: { userId, categoryId, date: { $gte: new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 1), $lt: new Date(new Date(date).getFullYear(), new Date(date).getMonth() + 1, 1) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const total = totalExpenses.length ? totalExpenses[0].total : 0;
      withinBudget = total <= budget.limit;
    } else {
      withinBudget = true; // No budget set, assume within budget
    }

    res.status(201).json({ message: 'Expense added successfully', withinBudget, expense: expense._id });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /expenses - Get all expenses for the user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ userId }).populate('categoryId', 'name').sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /expenses/:id - Delete an expense by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
