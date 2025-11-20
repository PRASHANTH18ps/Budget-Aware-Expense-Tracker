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
    const userId = req.user._id; // from auth middleware

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
    const expenseDate = new Date(date);
    const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
    const budget = await Budget.findOne({ userId, categoryId, month });
    let withinBudget = true;
    if (budget) {
      withinBudget = amount <= budget.limit;
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
    const userId = req.user._id;
    const expenses = await Expense.find({ userId }).populate('categoryId', 'name').sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /expenses/report/:month - Get expense report for a specific month
router.get('/report/:month', auth, async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.user._id;

    // Parse month (YYYY-MM)
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 1);

    // Get all categories for the user
    const categories = await Category.find({ userId });

    // Get expenses for the month
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lt: endDate }
    });

    // Get budgets for the month
    const budgets = await Budget.find({
      userId,
      month
    });

    // Aggregate data per category
    const report = categories.map(category => {
      const categoryExpenses = expenses.filter(exp => exp.categoryId.toString() === category._id.toString());
      const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const budget = budgets.find(b => b.categoryId.toString() === category._id.toString());
      const limit = budget ? budget.limit : 0;
      const remaining = limit - spent;

      return {
        categoryId: category._id,
        name: category.name,
        color: category.color,
        spent,
        limit,
        remaining
      };
    });

    res.json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /expenses/:id - Delete an expense by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
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
