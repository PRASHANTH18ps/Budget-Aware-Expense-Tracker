# Backend (Budget-Aware-Expense-Tracker)

This is the Node/Express backend for the Budget-Aware-Expense-Tracker app.

Requirements
- Node.js 18+ (tested with Node 20)
- MongoDB running locally (or provide a remote connection string)

Quick start

1. Install dependencies

```powershell
cd Backend
npm install
```

2. Create `.env` (or copy `.env.example`) and set values:

```properties
MONGO_URI=mongodb://127.0.0.1:27017/expenseTracker
JWT_SECRET=your_jwt_secret_here
```

3. Run the server

```powershell
npm start    # production
npm run dev  # nodemon for development
```

The backend listens on port 5000 by default and exposes these routes under `/api`:
- `POST /api/auth/signup` — create user
- `POST /api/auth/login` — login and receive JWT
- `GET/POST /api/categories` — categories (protected)
- `GET/POST /api/budgets` — budgets (protected)
- `GET/POST /api/expenses` — expenses (protected)

Notes
- Make sure your `.env` has `MONGO_URI` and `JWT_SECRET`. The server will fail to connect to MongoDB if `MONGO_URI` is missing.
