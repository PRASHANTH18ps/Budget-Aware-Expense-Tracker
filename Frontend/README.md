# Frontend (Budget-Aware-Expense-Tracker)

This is the React frontend (Create React App) for the Budget-Aware-Expense-Tracker app.

Quick start

1. Install dependencies

```powershell
cd Frontend
npm install
```

2. Start the dev server

```powershell
npm start
```

By default the frontend runs on port 3000 and the app expects the backend API at `http://localhost:5000/api`.
If your backend runs on a different host/port, open `src/api.js` and update the `API` constant.

Notes
- The `server/` folder contains a small local file-based mock server (no Mongo required). If you prefer to use the mock server instead of the real backend, navigate into `Frontend/server` and follow instructions in that folder's `README.md`.
