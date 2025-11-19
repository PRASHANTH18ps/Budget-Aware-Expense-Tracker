# Budget-Aware-Expense-Tracker

This repository contains a React frontend (`Frontend/`) and a Node/Express backend (`Backend/`).

Two ways to run the app locally:

1) Full stack (recommended) — Backend uses MongoDB

- Requirements: Node.js (>=16), npm, MongoDB running locally (or remote URI).
- Steps (PowerShell):

```powershell
cd "d:\GitHub Desktop\Budget-Aware-Expense-Tracker\Backend"
npm install
# copy .env.example to .env if needed and set MONGO_URI and JWT_SECRET
npm start

# in another terminal
cd "d:\GitHub Desktop\Budget-Aware-Expense-Tracker\Frontend"
npm install
npm start
```

Frontend is served at http://localhost:3000 and backend at http://localhost:5000.

2) Quick/dev (no Mongo required) — use the mock file-backed server bundled with the frontend

```powershell
cd "d:\GitHub Desktop\Budget-Aware-Expense-Tracker\Frontend\server"
npm install
npm start

# in another terminal
cd "d:\GitHub Desktop\Budget-Aware-Expense-Tracker\Frontend"
npm install
npm start
```

The mock server listens on port 5000 and implements the same `/api` endpoints so the frontend will work without Mongo.

Helper
- There's a helper PowerShell script `run-all.ps1` at the repo root that opens two PowerShell windows and runs the backend and frontend start commands for you. See instructions below.

Troubleshooting
- "Cannot use import statement outside a module" — fixed by setting `type: "module"` in `Backend/package.json`.
- `MONGO_URI` undefined — ensure you run Node from `Backend` directory or set environment variables. There's a `Backend/.env.example` you can copy.
- If port 5000 is in use, the mock server will attempt the next port; you can also change ports in those servers.

# A single-command dev flow
I've added a root `package.json` with a `dev` script that starts the Backend and Frontend concurrently using `concurrently`.

To use it:

```powershell
cd "d:\GitHub Desktop\Budget-Aware-Expense-Tracker"
npm install
npm run dev
```

This will run the Backend (nodemon) and the Frontend (react-scripts) in one terminal. If you'd prefer two separate windows the existing `run-all.ps1` still works.

If you'd like I can also add VS Code tasks or a devcontainer for an even smoother one-click experience.

# Budget-Aware Expense Tracker

