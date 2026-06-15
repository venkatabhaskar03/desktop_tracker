# Laptop Tracker — Desktop Monitoring Dashboard

FastAPI backend + React/Tailwind frontend for monitoring employee laptops (system health, login/logout events, running applications, USB activity).

---

## Prerequisites

| Tool | Version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| PostgreSQL | 13+ (remote DB already running) |

---

## Project Structure

```
laptop_tracker/
├── backend/          FastAPI app (Python)
│   ├── .env          DB credentials (not committed — create from .env.example)
│   ├── main.py
│   ├── requirements.txt
│   └── alembic/      Database migrations
└── frontend/         React + Vite + Tailwind dashboard
    ├── .env.local    API URL (not committed — create manually)
    └── src/
```

---

## 1 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install psycopg2-binary
```

### Create `.env` file

Create `backend/.env` with your database credentials:

```env
DB_HOST=157.151.171.221
DB_PORT=5432
DB_NAME=monitoring
DB_USER=ritemon
DB_PASSWORD=Rite@234
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Run database migration (first time only)

```bash
cd backend
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Running upgrade  -> 001, Add extended columns to login_logout table
```

To check migration status:
```bash
alembic current
# Should show: 001 (head)
```

### Start the backend server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**

API docs (Swagger UI): **http://localhost:8000/docs**

---

## 2 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo VITE_API_URL=http://localhost:8000 > .env.local
```

### Start the frontend dev server

```bash
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 3 — Running Both Together

Open two terminals side by side:

**Terminal 1 — Backend:**
```bash
cd backend
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 4 — Build Frontend for Production

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/`. Serve it with any static file server or configure FastAPI to serve it directly.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | Summary counts (users, devices, activity) |
| GET | `/activity` | System health records (CPU, RAM, disk) |
| POST | `/activity` | Insert system health record (from agent) |
| GET | `/loginlogout` | Login/logout events |
| POST | `/loginlogout` | Insert login/logout event (from agent) |
| GET | `/applications` | Running application snapshots |
| POST | `/applications` | Insert application snapshot (from agent) |
| GET | `/usb` | USB device events |
| POST | `/usb` | Insert USB event (from agent) |

---

## Troubleshooting

**Backend won't start — `ModuleNotFoundError`**
```bash
pip install -r requirements.txt
pip install psycopg2-binary
```

**`asyncpg` connection refused**
- Verify `.env` credentials are correct
- Ensure the PostgreSQL server at `DB_HOST` is reachable

**Frontend shows "Failed to fetch"**
- Confirm backend is running on port 8000
- Check `frontend/.env.local` has `VITE_API_URL=http://localhost:8000`

**Alembic `DuplicateColumn` error**
- The migration already ran. Check with `alembic current` — if it shows `001 (head)`, you're good.

**Alembic password `%` interpolation error**
- Already handled in `alembic/env.py` — engine is built directly with `quote_plus` encoding.
