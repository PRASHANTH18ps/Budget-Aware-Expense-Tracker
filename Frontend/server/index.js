const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

require('dotenv').config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const app = express();
app.use(cors());
app.use(express.json());

(async function main() {
  // use simple file-based storage to avoid ESM adapter issues
  const fs = require('fs');
  const { nanoid } = await import('nanoid').then(m => m);

  const file = path.join(__dirname, 'db.json');

  function ensureDb() {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify({ users: [], categories: [], budgets: [], expenses: [] }, null, 2));
    }
  }

  function readDb() {
    ensureDb();
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw || '{}');
  }

  function writeDb(data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  ensureDb();

  // helper: auth middleware
  function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });
    const parts = header.split(' ');
    if (parts.length !== 2) return res.status(401).json({ message: 'Invalid token' });
    const token = parts[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });
    const data = readDb();
    const exists = data.users.find(u => u.email === email);
    if (exists) return res.status(400).json({ message: 'User exists' });
    const hashed = await bcrypt.hash(password, 8);
    const user = { id: nanoid(), email, password: hashed, firstName: firstName || '', lastName: lastName || '' };
    data.users.push(user);
    writeDb(data);
    return res.status(201).json({ message: 'ok' });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });
    const data = readDb();
    const user = data.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  });

  // current user
  app.get('/api/me', auth, async (req, res) => {
    const data = readDb();
    const user = data.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safe } = user;
    res.json(safe);
  });

  // Categories
  app.get('/api/categories', auth, async (req, res) => {
    const data = readDb();
    const categories = data.categories.filter(c => c.userId === req.user.id);
    res.json(categories);
  });

  app.post('/api/categories', auth, async (req, res) => {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });
    const data = readDb();
    const cat = { _id: nanoid(), userId: req.user.id, name, color: color || '#888' };
    data.categories.push(cat);
    writeDb(data);
    res.status(201).json(cat);
  });

  app.put('/api/categories/:id', auth, async (req, res) => {
    const id = req.params.id;
    const data = readDb();
    const cat = data.categories.find(c => c._id === id && c.userId === req.user.id);
    if (!cat) return res.status(404).json({ message: 'not found' });
    cat.name = req.body.name ?? cat.name;
    cat.color = req.body.color ?? cat.color;
    writeDb(data);
    res.json(cat);
  });

  app.delete('/api/categories/:id', auth, async (req, res) => {
    const id = req.params.id;
    const data = readDb();
    data.categories = data.categories.filter(c => !(c._1d === id && c.userId === req.user.id));
    // fallback in case previous line used _id key
    data.categories = data.categories.filter(c => !(c._id === id && c.userId === req.user.id));
    writeDb(data);
    res.json({});
  });

  // Budgets
  app.get('/api/budgets/:month', auth, async (req, res) => {
    const month = req.params.month;
    const data = readDb();
    const budgets = data.budgets.filter(b => b.userId === req.user.id && b.month === month);
    res.json(budgets);
  });

  app.post('/api/budgets', auth, async (req, res) => {
    const { categoryId, month, limit } = req.body;
    if (!categoryId || !month) return res.status(400).json({ message: 'categoryId and month required' });
    const data = readDb();
    const existing = data.budgets.find(b => b.userId === req.user.id && b.categoryId === categoryId && b.month === month);
    if (existing) {
      existing.limit = Number(limit || 0);
      writeDb(data);
      return res.json(existing);
    }
    const b = { _id: nanoid(), userId: req.user.id, categoryId, month, limit: Number(limit || 0) };
    data.budgets.push(b);
    writeDb(data);
    res.status(201).json(b);
  });

  // Expenses
  app.get('/api/expenses/:month', auth, async (req, res) => {
    const month = req.params.month; // YYYY-MM
    const data = readDb();
    const expenses = (data.expenses || []).filter(e => {
      if (e.userId !== req.user.id) return false;
      if (!e.date) return false;
      return e.date.startsWith(month);
    });
    res.json(expenses);
  });

  app.post('/api/expenses', auth, async (req, res) => {
    const { categoryId, amount, date } = req.body;
    if (!categoryId || !amount) return res.status(400).json({ message: 'categoryId and amount required' });
    const d = date || new Date().toISOString().slice(0, 10);
    const data = readDb();
    const exp = { _id: nanoid(), userId: req.user.id, categoryId, amount: Number(amount), date: d };
    data.expenses.push(exp);
    writeDb(data);

    // After saving, compute if over budget for this category in that month
    const month = d.slice(0, 7);
    const budgets = data.budgets.filter(b => b.userId === req.user.id && b.month === month && b.categoryId === categoryId);
    const limit = budgets.length ? budgets[0].limit : 0;
    const spent = data.expenses.filter(e => e.userId === req.user.id && e.categoryId === categoryId && e.date.startsWith(month)).reduce((s, x) => s + Number(x.amount || 0), 0);

    const over = limit > 0 && spent > limit;

    res.status(201).json({ ...exp, over, spent, limit });
  });

  // Reports
  app.get('/api/reports/:month', auth, async (req, res) => {
    const month = req.params.month;
    const data = readDb();
    const categories = data.categories.filter(c => c.userId === req.user.id);
    const budgets = data.budgets.filter(b => b.userId === req.user.id && b.month === month);
    const expenses = data.expenses.filter(e => e.userId === req.user.id && e.date && e.date.startsWith(month));

    const report = categories.map((c) => {
      const b = budgets.find(x => x.categoryId === c._id);
      const limit = b ? Number(b.limit) : 0;
      const spent = expenses.filter(e => e.categoryId === c._id).reduce((s, x) => s + Number(x.amount || 0), 0);
      return {
        categoryId: c._id,
        categoryName: c.name,
        color: c.color,
        limit,
        spent,
        remaining: limit > 0 ? limit - spent : null,
        over: limit > 0 && spent > limit,
      };
    });

    res.json(report);
  });

  function startListening(port) {
    const srv = app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
    srv.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying ${port + 1}`);
        startListening(port + 1);
      } else {
        console.error('Server error', err);
      }
    });
  }

  startListening(PORT);

})();
