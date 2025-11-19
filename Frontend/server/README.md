# Expense Tracker - Server

Minimal Express server for the Budget-Aware Expense Tracker. Uses lowdb (file-backed JSON) for persistence so you can run locally without a database.

Setup

1. Copy `.env.example` to `.env` and set `JWT_SECRET`.
2. Install dependencies and start the server:

```powershell
cd server
npm install
npm start
```

The server listens on `http://localhost:5000` by default and exposes the API under `/api` (for example `POST /api/auth/login`).

Endpoints
- POST /api/auth/signup { email, password }
- POST /api/auth/login { email, password } -> { token }
- GET/POST/PUT/DELETE /api/categories
- GET/POST /api/budgets and GET /api/budgets/:month
- GET/POST /api/expenses and GET /api/expenses/:month
- GET /api/reports/:month

Notes
- This is a development server with file-based storage. For production use a real database.
